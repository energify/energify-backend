import { IsNumber, Min } from "class-validator";

export class UpdateMeter {
  @Min(0.1)
  @IsNumber()
  measurement: number;
}
