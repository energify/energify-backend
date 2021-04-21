import { IsNumber, Min } from "class-validator";

export class CreateTransactionDto {
  @IsNumber()
  consumerId: number;

  @IsNumber()
  prosumerId: number;

  @Min(0.0)
  amount: number;
}
