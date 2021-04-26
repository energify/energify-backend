import { Controller, Get, Header, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { AuthedUser } from "src/shared/decorators/authed-user.decorator";
import { Public } from "src/shared/decorators/public.decorator";
import { IAuthedUser } from "src/users/interfaces/iauthed-user.entity";
import { InvoicesService } from "./invoices.service";

@Controller("invoices")
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get(":paymentId")
  async generatePdf(
    @Res() res: Response,
    @Param("paymentId") paymentId: number,
    @AuthedUser() user: IAuthedUser
  ) {
    const stream = await this.invoicesService.generatePdfByPaymentId(paymentId, user);
    return stream.pipe(res);
  }
}
