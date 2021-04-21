import { IsNotEmpty, Min } from "class-validator";

export class CreateTransactionDto {
  //TODO
  @IsNotEmpty()
  supplier: string;
  @IsNotEmpty()
  receiver: string;

  @Min(0.0)
  amount: number;
}
