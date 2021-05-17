import { IsNumber } from "class-validator";

export class AddMeasureDto {
  @IsNumber()
  value: number;

  @IsNumber()
  timestamp: number;
}
