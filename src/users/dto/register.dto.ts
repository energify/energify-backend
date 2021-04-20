import { Transform } from "class-transformer";
import { IsDate, IsEmail, IsIn, IsNotEmpty, IsString } from "class-validator";
import { parse as parseDate } from "date-fns";

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsDate()
  @Transform(({ value }) => parseDate(value, "dd/MM/yyyy", new Date()))
  bornAt: Date;

  @IsString()
  cc: string;

  @IsString()
  @IsIn(["M", "F", "U"])
  sex: string;
}
