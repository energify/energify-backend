import { Body, Controller, Delete, Get, Post, Put } from "@nestjs/common";
import { AuthedUser } from "src/shared/decorators/authed-user.decorator";
import { Public } from "src/shared/decorators/public.decorator";
import { CompleteDto } from "./dto/complete.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { UpdatePricesDto } from "./dto/update-prices.dto";
import { IAuthedUser } from "./interfaces/iauthed-user.interface";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post("login")
  @Public()
  async login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  @Post("register")
  @Public()
  async register(@Body() dto: RegisterDto) {
    return this.usersService.register(dto);
  }

  @Put("complete")
  async complete(@Body() dto: CompleteDto, @AuthedUser() user: IAuthedUser) {
    return this.usersService.complete(dto, user);
  }

  @Put("prices")
  async updatePriceByAuthedUser(@Body() dto: UpdatePricesDto, @AuthedUser() user: IAuthedUser) {
    return this.usersService.updatePrices(dto, user);
  }

  @Get("details")
  async details(@AuthedUser() user: IAuthedUser) {
    return this.usersService.findById(user.id);
  }

  @Get("prices")
  async findPricesByAuthedUser(@AuthedUser() user: IAuthedUser) {
    return this.usersService.findPricesById(user.id);
  }

  @Delete("logout")
  async logout() {}
}
