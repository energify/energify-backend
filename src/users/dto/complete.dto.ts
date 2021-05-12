import { IsNotEmpty, IsOptional } from "class-validator";

export class CompleteDto {
  @IsNotEmpty()
  nif: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  hederaAccountId: string;

  @IsOptional()
  pictureUrl: string;
}
