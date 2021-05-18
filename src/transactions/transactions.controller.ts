import { BadRequestException, Controller, Get, Param } from "@nestjs/common";
import { subHours } from "date-fns";
import { AuthedUser } from "src/shared/decorators/authed-user.decorator";
import { IAuthedUser } from "src/users/interfaces/iauthed-user.interface";
import { TransactionsService } from "./transactions.service";

@Controller("transactions")
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get("user")
  async findByAuthedUser(@AuthedUser() authedUser: IAuthedUser) {
    return this.transactionsService.findByUserId(authedUser.id);
  }

  @Get("energy-flow/:start/:end")
  async findAuthedUserEnergySources(
    @AuthedUser() authedUser: IAuthedUser,
    @Param("start") start: Date,
    @Param("end") end: Date
  ) {
    return this.transactionsService.findUserEnergyFlowByDateRange(authedUser.id, start, end);
  }

  @Get("energy-history/:interval/:scale")
  async findEnergyLast24Hours(
    @AuthedUser() authedUser: IAuthedUser,
    @Param("interval") interval: string,
    @Param("scale") scale: number
  ) {
    if (!["1h", "1d", "1w", "1m", "1y"].includes(interval)) {
      throw new BadRequestException("Interval is not valid.");
    }

    return this.transactionsService.findUserEnergyByInterval(authedUser.id, interval, scale);
  }

  @Get("price-24hours")
  async findPriceLast24Hours() {
    return this.transactionsService.findAvgPriceByDateRange(subHours(new Date(), 24), new Date());
  }

  @Get("price-history/:interval/:scale")
  async findPriceHistoryByInterval(
    @Param("interval") interval: string,
    @Param("scale") scale: number
  ) {
    if (!["1h", "1d", "1w", "1m", "1y"].includes(interval)) {
      throw new BadRequestException("Interval is not valid.");
    }

    return this.transactionsService.findPriceHistoryByInterval(interval, scale);
  }
}
