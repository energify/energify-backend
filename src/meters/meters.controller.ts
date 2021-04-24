import { Body, Controller, Delete, Get, Param, Put } from "@nestjs/common";
import { AuthedUser } from "src/shared/decorators/authed-user.decorator";
import { IAuthedUser } from "src/users/interfaces/iauthed-user.interface";
import { UpdateMeasurement } from "./dto/update-measurement.dto";
import { MetersService } from "./meters.service";

@Controller("meters")
export class MetersController {
  constructor(private metersService: MetersService) {}

  @Get("user")
  async findByAuthedUser(@AuthedUser() user: IAuthedUser) {
    return this.metersService.findByUser(user);
  }

  @Put("user")
  async updateByAuthedUser(@Body() dto: UpdateMeasurement, @AuthedUser() user: IAuthedUser) {
    return this.metersService.updateByUser(user, dto);
  }
}
