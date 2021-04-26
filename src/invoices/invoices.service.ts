import { Injectable } from "@nestjs/common";
import fetch from "node-fetch";
import { PaymentsService } from "src/payments/payments.service";
import { Readable } from "stream";

@Injectable()
export class InvoicesService {
  constructor(private paymentsService: PaymentsService) {}

  async generatePdfByPaymentId(paymentId: number) {
    const payment = await this.paymentsService.findById(paymentId);
    const consumer = await payment.consumer;
    const prosumer = await payment.prosumer;

    const t = await fetch("https://invoice-generator.com", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        from: prosumer.name,
        to: consumer.name,
        number: payment.id,
        currency: "EUR",
        date: null,
        items: [
          {
            name: "Energy Transfered",
            quantity: 1, //TODO
            unit_cost: payment.amount,
          },
        ],
        fields: { tax: "%" },
        tax: 23,
      }),
    });
    const readable = new Readable();
    readable.push(await t.buffer());
    readable.push(null);
    return readable;
  }
}
