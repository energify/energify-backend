import { Body, Controller, Delete, Post, Put } from "@nestjs/common";
import { AuthedUser } from "src/shared/decorators/authed-user.decorator";
import { Public } from "src/shared/decorators/public.decorator";
import { CompleteDto } from "./dto/complete.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { IAuthedUser } from "./interfaces/iauthed-user.entity";
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
  async complete(@Body() dto: CompleteDto, @AuthedUser() authedUser: IAuthedUser) {
    await this.usersService.complete(dto, authedUser);
    return { message: "Account completed with success." };
  }

  @Delete("logout")
  async logout() {}
}
