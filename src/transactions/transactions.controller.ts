import { BadRequestException, Controller, Get, Param } from "@nestjs/common";
import { format as formatDate, subHours } from "date-fns";
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

  @Get("stats")
  async findStatsByAuthedUser(@AuthedUser() authedUser: IAuthedUser) {
    return this.transactionsService.findStatsByUserId(authedUser.id);
  }

  @Get("price-24hours")
  async findPriceLast24Hours() {
    return this.transactionsService.findPriceByDateRange(subHours(new Date(), 24), new Date());
  }

  @Get("price-history/:interval")
  async findPriceHistoryByInterval(@Param("interval") interval: "1h" | "1d" | "1w" | "1m" | "1y") {
    if (!["1h", "1d", "1w", "1m"].includes(interval)) {
      throw new BadRequestException("Interval is not valid.");
    }

    return this.transactionsService.findPriceHistoryByInterval(interval);
  }
}
