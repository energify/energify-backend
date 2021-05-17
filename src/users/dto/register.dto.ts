import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { parse as parseDate } from "date-fns";

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseDate(value, "yyyy-MM-dd", new Date()))
  birthday: Date;

  @IsString()
  cc: string;
}
