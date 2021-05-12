import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { CompleteDto } from "./dto/complete.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { hash, compare } from "bcrypt";
import { sign as signJwt } from "jsonwebtoken";
import { ConfigService } from "@nestjs/config";
import { IAuthedUser } from "./interfaces/iauthed-user.interface";
import { Roles } from "src/shared/enums/roles.enum";
import { RedisService } from "nestjs-redis";
import { UpdatePricesDto } from "./dto/update-prices.dto";
import { IPrices } from "./interfaces/iprices.interface";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private configService: ConfigService,
    private redisService: RedisService
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({ email: dto.email });

    if (!user || !(await compare(dto.password, user.password))) {
      throw new BadRequestException("Wrong credentials");
    }

    return { accessToken: signJwt({ ...user }, this.configService.get<string>("JWT_SECRET")) };
  }

  async register(dto: RegisterDto) {
    const userExists = await this.usersRepository.findOne({ email: dto.email });

    if (userExists) {
      throw new BadRequestException("Email is already in use");
    }

    const encPassword = await hash(dto.password, 10);
    const user = this.usersRepository.create({
      ...dto,
      password: encPassword,
    });
    const { password, ...userWithoutPassword } = await this.usersRepository.save(user);

    return userWithoutPassword;
  }

  async complete(dto: CompleteDto, authedUser: IAuthedUser) {
    const user = await this.usersRepository.findOne(authedUser.id);

    if (user.role !== Roles.Unverified) {
      throw new BadRequestException("Account is already completed");
    }

    await this.usersRepository.update(user.id, { ...dto, role: Roles.Consumer });

    return { message: "Account completed with success." };
  }

  async updatePrices(dto: UpdatePricesDto, authedUser: IAuthedUser) {
    const prices: IPrices = {
      buyPrice: dto.buyPrice,
      sellPrice: dto.sellPrice,
      updatedAt: new Date(),
      userId: authedUser.id,
    };

    await this.redisService.getClient().set(`prices.${authedUser.id}`, JSON.stringify(prices));

    return { message: "Prices updated with success." };
  }

  async logout() {}

  async findById(id: number) {
    return this.usersRepository.findOneOrFail(id);
  }

  async findConsumerById(id: number) {
    return this.usersRepository.findOneOrFail({ id, role: Roles.Consumer });
  }

  async findProsumerById(id: number) {
    return this.usersRepository.findOneOrFail({ id, role: Roles.Prosumer });
  }

  async findConsumerByIds(id: number[]) {
    return this.usersRepository.findByIds(id, { where: { role: Roles.Consumer } });
  }

  async findProsumerByIds(id: number[]) {
    return this.usersRepository.findByIds(id, { where: { role: Roles.Prosumer } });
  }

  async findPricesById(id: number) {
    const pricesTxt = await this.redisService.getClient().get(`prices.${id}`);

    if (!pricesTxt) {
      throw new NotFoundException("User did not set prices yet.");
    }

    return JSON.parse(pricesTxt) as IPrices;
  }

  async findAllPrices() {
    const keys = await this.redisService.getClient().keys("prices.*");
    const values = new Array<IPrices>();

    for (const key of keys) {
      values.push(JSON.parse(await this.redisService.getClient().get(key)));
    }

    return values;
  }
}
