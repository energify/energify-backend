import { Controller, Get, Param } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get(":id")
  async findById(@Param() id: number) {
    return this.findById(id);
  }
}
