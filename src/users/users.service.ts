import { BadRequestException, Injectable } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { CompleteDto } from "./dto/complete.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { hash, compare } from "bcrypt";
import { sign as signJwt } from "jsonwebtoken";
import { ConfigService } from "@nestjs/config";
import { IAuthedUser } from "./interfaces/iauthed-user.entity";
import { Roles } from "src/shared/enums/roles.enum";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private configService: ConfigService
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
    const user = this.usersRepository.create({ ...dto, password: encPassword });
    const { password, ...userWithoutPassword } = await this.usersRepository.save(user);

    return userWithoutPassword;
  }

  async complete(dto: CompleteDto, authedUser: IAuthedUser) {
    const user = await this.usersRepository.findOne(authedUser.id);

    if (user.role !== Roles.Unverified) {
      throw new BadRequestException("Account is already completed");
    }

    return this.usersRepository.update(user.id, { ...dto, role: Roles.Consumer });
  }

  async logout() {}
}
