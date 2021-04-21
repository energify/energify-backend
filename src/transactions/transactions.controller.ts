import { Controller, Get, Param } from "@nestjs/common";
import { AuthedUser } from "src/shared/decorators/authed-user.decorator";
import { IAuthedUser } from "src/users/interfaces/iauthed-user.entity";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get("user")
  async findByAuthedUser(@AuthedUser() authedUser: IAuthedUser) {
    return this.transactionsService.findByUserId(authedUser.id);
  }
}
