import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { HederaService } from "src/hedera/hedera.service";
import { Repository } from "typeorm";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { Payment } from "./entities/payment.entity";
import { PaymentStatus } from "./enums/payment.status";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentsRepository: Repository<Payment>,
    private hederaService: HederaService
  ) {}

  async create(dto: CreatePaymentDto) {
    return this.paymentsRepository.save({ ...dto });
  }

  async update(id: number, dto: UpdatePaymentDto, authedUserId?: number) {
    const payment = await this.paymentsRepository.findOneOrFail(id);
    const isDuplicated = !!(await this.findByHederaTransactionId(dto.hederaTransactionId));

    const { hederaAccountId: senderId } = await payment.consumer;
    const { hederaAccountId: receiverId } = await payment.prosumer;

    if (isDuplicated) {
      throw new BadRequestException("Hedera transaction id belongs to an old payment.");
    } else if (!authedUserId && payment.consumerId !== authedUserId) {
      throw new ForbiddenException("You cannot perform this payment.");
    } else if (
      this.hederaService.isTransactionValid(
        payment.hederaTransactionId,
        senderId,
        receiverId,
        payment.amount
      )
    ) {
      await this.paymentsRepository.update(id, { ...dto, status: PaymentStatus.Paid });
    }

    throw new BadRequestException("Payment was not completed yet.");
  }

  async findById(id: number) {
    return this.paymentsRepository.findOne(id);
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

  async findByHederaTransactionId(hederaTransactionId: string) {
    return this.paymentsRepository.findOne({ hederaTransactionId });
  }
}
