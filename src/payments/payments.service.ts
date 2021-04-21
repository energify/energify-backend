import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { Payment } from "./entities/payment.entity";
import { PaymentStatus } from "./enums/payment.status";

@Injectable()
export class PaymentsService {
  constructor(@InjectRepository(Payment) private paymentsRepository: Repository<Payment>) {}

  async create(dto: CreatePaymentDto) {
    return this.paymentsRepository.save({ ...dto });
  }

  async update(id: number, dto: UpdatePaymentDto, authedUserId?: number) {
    const payment = await this.paymentsRepository.findOneOrFail(id);

    if (!authedUserId && payment.consumerId !== authedUserId) {
      throw new ForbiddenException();
    }

    //TODO: Check if payment is done or not using hedera network
    //and update status accordingly.
    return this.paymentsRepository.update(id, { ...dto });
  }

  async findByUserId(userId: number) {
    return this.paymentsRepository.find({
      where: [{ prosumerId: userId }, { consumerId: userId }],
    });
  }

  async findUnpaidByUserId(userId: number) {
    return this.paymentsRepository.find({
      where: [
        { prosumerId: userId, status: PaymentStatus.Unpaid },
        { consumerId: userId, status: PaymentStatus.Unpaid },
      ],
    });
  }

  async findPaidByUserId(userId: number) {
    return this.paymentsRepository.find({
      where: [
        { prosumerId: userId, status: PaymentStatus.Paid },
        { consumerId: userId, status: PaymentStatus.Paid },
      ],
    });
  }
}
