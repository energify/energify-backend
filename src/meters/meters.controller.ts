import { Controller, Get, Param } from "@nestjs/common";
import { MetersService } from "./meters.service";

@Controller("meters")
export class MetersController {
  constructor(private metersService: MetersService) {}

  @Get(":id")
  async findById(@Param("id") id: number) {
    return this.metersService.findById(id);
  }
}
