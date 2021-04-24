import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Interval } from "@nestjs/schedule";
import fetch from "node-fetch";
import { IHederaTransaction } from "./interfaces/ihedera-transaction.interface";

@Injectable()
export class HederaService {
  private mirrorUrl: string;
  private hbarToEurRate: number;

  constructor(private configService: ConfigService) {
    this.mirrorUrl = this.configService.get<string>("HEDERA_MIRROR_URL");
  }

  async findTransactionByAccountId(transactionId: string, accountId: string) {
    const response = await fetch(`${this.mirrorUrl}/api/v1/transactions?account.id=${accountId}`);
    const { transactions } = await response.json();

    return transactions.find((t) => t.transaction_id === transactionId) as IHederaTransaction;
  }

  async isTransactionValid(
    transactionId: string,
    senderId: string,
    receiverId: string,
    amount: number
  ) {
    const { transfers, result } = await this.findTransactionByAccountId(transactionId, senderId);

    const { amount: senderAmount } = transfers.find((t) => t.account === senderId);
    const { amount: receiverAmount } = transfers.find((t) => t.account === receiverId);

    return (
      result === "SUCCESS" &&
      this.tinybarsToBars(senderAmount) === -amount &&
      this.tinybarsToBars(receiverAmount) === amount
    );
  }

  tinybarsToBars(value: number) {
    return value / 10000000;
  }

  @Interval(1000 * 60 * 30)
  async updateHbarToEurRate() {}
}
