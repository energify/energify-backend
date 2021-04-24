import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { AuthedUser } from "src/shared/decorators/authed-user.decorator";
import { IAuthedUser } from "src/users/interfaces/iauthed-user.interface";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Put(":id")
  async update(
    @Param("id") id: number,
    @Body() dto: UpdatePaymentDto,
    @AuthedUser() authedUser: IAuthedUser
  ) {
    return this.paymentsService.update(id, dto, authedUser.id);
  }

  @Get("user")
  async findByAuthedUser(@AuthedUser() authedUser: IAuthedUser) {
    return this.paymentsService.findByUserId(authedUser.id);
  }

  @Get("user/unpaid")
  async findUnpaidByAuthedUser(@AuthedUser() authedUser: IAuthedUser) {
    return this.paymentsService.findUnpaidByUserId(authedUser.id);
  }

  @Get("user/paid")
  async findPaidByAuthedUser(@AuthedUser() authedUser: IAuthedUser) {
    return this.paymentsService.findPaidByUserId(authedUser.id);
  }
}
