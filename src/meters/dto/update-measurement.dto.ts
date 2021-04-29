import { IsNumber, Min } from "class-validator";

export class UpdateMeasurement {
  @Min(0.1)
  @IsNumber()
  value: number;
}
