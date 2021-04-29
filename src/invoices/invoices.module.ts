import { Module } from "@nestjs/common";
import { InvoicesService } from "./invoices.service";
import { InvoicesController } from "./invoices.controller";
import { PaymentsModule } from "src/payments/payments.module";

@Module({
  imports: [PaymentsModule],
  providers: [InvoicesService],
  controllers: [InvoicesController],
})
export class InvoicesModule {}
