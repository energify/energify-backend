import { IsNumber } from "class-validator";

export class UpdateMeasurement {
  @IsNumber()
  value: number;
}
