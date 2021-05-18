import { Body, Controller, Delete, Get, Param, Put } from "@nestjs/common";
import { AuthedUser } from "src/shared/decorators/authed-user.decorator";
import { IAuthedUser } from "src/users/interfaces/iauthed-user.interface";
import { AddMeasureDto } from "./dto/add-measure.dto";
import { MetersService } from "./meters.service";

@Controller("meters")
export class MetersController {
  constructor(private metersService: MetersService) {}

  @Get("user")
  async findMeasureByAuthedUser(@AuthedUser() user: IAuthedUser) {
    return this.metersService.findMeasuresByUserId(user.id);
  }

  @Put("user")
  async addMeasureByAuthedUser(@Body() dto: AddMeasureDto, @AuthedUser() user: IAuthedUser) {
    return this.metersService.addMeasuresByUserId(user.id, dto);
  }
}
