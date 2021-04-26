import { ForbiddenException, Injectable } from "@nestjs/common";
import fetch from "node-fetch";
import { PaymentsService } from "src/payments/payments.service";
import { IAuthedUser } from "src/users/interfaces/iauthed-user.entity";
import { Readable } from "stream";

@Injectable()
export class InvoicesService {
  constructor(private paymentsService: PaymentsService) {}

  async generatePdfByPaymentId(paymentId: number, user: IAuthedUser) {
    const payment = await this.paymentsService.findById(paymentId);
    const consumer = await payment.consumer;
    const prosumer = await payment.prosumer;

    if (user.id != consumer.id && user.id != prosumer.id) {
      throw new ForbiddenException("User do not have permission to visualize this invoice.");
    }

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
