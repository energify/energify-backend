import { IsNotEmpty } from "class-validator";

export class CompleteDto {
  @IsNotEmpty()
  nif: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  pictureUrl: string;
}
