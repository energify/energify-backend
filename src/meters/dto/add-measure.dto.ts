import { IsDefined, IsNumber } from "class-validator";

class MeasureDto {
  @IsNumber()
  value: number;

  @IsNumber()
  timestamp: number;
}

export class AddMeasureDto {
  @IsDefined()
  measures: MeasureDto[];
}
