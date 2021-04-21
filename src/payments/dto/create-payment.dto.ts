import { Min } from "class-validator";

export class CreatePaymentDto {
  @Min(0.1)
  amount: number;

  @Min(1)
  consumerId: number;

  @Min(1)
  prosumerId: number;
}
