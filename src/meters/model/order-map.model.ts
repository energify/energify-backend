import {
  PUBLIC_GRID_BUY_PRICE,
  PUBLIC_GRID_SELL_PRICE,
  PUBLIC_GRID_USER_ID,
} from "src/shared/consts";
import { IPrices } from "src/users/interfaces/iprices.interface";
import { IMatch } from "../interfaces/imatch.interface";
import { IMeasure } from "../interfaces/imeasure.interface";
import { IOrder } from "../interfaces/iorder.interface";

export class OrderMap {
  public buyOrders = new Array<IOrder>();
  public sellOrders = new Array<IOrder>();
  private matches = new Array<IMatch>();

  constructor(prices: IPrices[], measurements: IMeasure[]) {
    for (const measurement of measurements) {
      const price = prices.find((p) => p.userId === measurement.userId);
      const { userId, value } = measurement;

      if (measurement.value > 0) {
        this.sellOrders.push({ amount: value, price: price.sellPrice, userId });
      } else {
        this.buyOrders.push({ amount: Math.abs(value), price: price.buyPrice, userId });
      }
    }
  }

  match() {
    const sortedBuyers = this.sortBuyers().reduce((a, b) => a.concat(b), []);
    const sortedSellers = this.sortSellers().reduce((a, b) => a.concat(b), []);

    for (let bi = 0; bi < sortedBuyers.length; bi++) {
      const buyer = sortedBuyers[bi];

      if (buyer.amount === 0) continue;

      if (sortedSellers.length === 0) {
        this.addMatch(buyer.amount, buyer.userId, PUBLIC_GRID_USER_ID, PUBLIC_GRID_BUY_PRICE);
      }

      for (let si = 0; si < sortedSellers.length; si++) {
        const seller = sortedSellers[si];

        if (seller.amount === 0) continue;

        if (seller.price > buyer.price) {
          this.addMatch(buyer.amount, buyer.userId, PUBLIC_GRID_USER_ID, PUBLIC_GRID_BUY_PRICE);
          break;
        }

        if (seller.amount < buyer.amount) {
          this.addMatch(seller.amount, buyer.userId, seller.userId, seller.price);
          buyer.amount = parseFloat((buyer.amount - seller.amount).toFixed(2));
          seller.amount = 0;
        } else if (seller.amount === buyer.amount) {
          this.addMatch(buyer.amount, buyer.userId, seller.userId, seller.price);
          seller.amount = 0;
          buyer.amount = 0;
          break;
        } else {
          this.addMatch(buyer.amount, buyer.userId, seller.userId, seller.price);
          seller.amount = parseFloat((seller.amount - buyer.amount).toFixed(2));
          buyer.amount = 0;
          break;
        }
      }
    }

    for (const seller of sortedSellers.filter((s) => s.amount !== 0)) {
      this.addMatch(seller.amount, PUBLIC_GRID_USER_ID, seller.userId, PUBLIC_GRID_SELL_PRICE);
    }

    return this.matches;
  }

  private addMatch(amount: number, consumerId: number, prosumerId: number, price: number) {
    this.matches.push({ amount, consumerId, prosumerId, price });
  }

  private sortBuyers() {
    let buyers = this.buyOrders.filter((b) => b.amount !== 0).sort((a, b) => a.price - b.price);
    let sortedBuyers = new Array<IOrder[]>();
    let pricesAlreadySorted = new Set<number>();

    for (const buyer of buyers) {
      if (pricesAlreadySorted.has(buyer.price)) {
        continue;
      }
      sortedBuyers.push(
        this.buyOrders.filter((b) => b.price === buyer.price).sort((a, b) => b.amount - a.amount)
      );
      pricesAlreadySorted.add(buyer.price);
    }

    return sortedBuyers;
  }

  private sortSellers() {
    let sellers = this.sellOrders.filter((b) => b.amount !== 0).sort((a, b) => a.price - b.price);
    let sortedSellers = new Array<IOrder[]>();
    let pricesAlreadySorted = new Set<number>();

    for (const seller of sellers) {
      if (pricesAlreadySorted.has(seller.price)) {
        continue;
      }
      sortedSellers.push(
        this.sellOrders.filter((b) => b.price === seller.price).sort((a, b) => a.amount - b.amount)
      );
      pricesAlreadySorted.add(seller.price);
    }

    return sortedSellers;
  }
}
