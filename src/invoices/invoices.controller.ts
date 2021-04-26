import { Controller, Get, Header, Param } from "@nestjs/common";
import { Public } from "src/shared/decorators/public.decorator";
import { InvoicesService } from "./invoices.service";

@Controller("invoices")
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get(":paymentId")
  @Public()
  @Header("content-type", "application/pdf")
  @Header("content-disposition", "attachment; filename=test.pdf")
  async generatePdf(@Param("paymentId") paymentId: number) {
    return this.invoicesService.generatePdfByPaymentId(paymentId);
  }
}
