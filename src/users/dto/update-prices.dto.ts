import { Min } from "class-validator";

export class UpdatePricesDto {
  @Min(0.01)
  sellPrice: number;

  @Min(0.01)
  buyPrice: number;
}
