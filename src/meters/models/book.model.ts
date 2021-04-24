import { IPrices } from "src/users/interfaces/iprices.interface";
import { IMeasure } from "../interfaces/imeasure.interface";

export interface IBookEntry {
  userId: number;
  amount: number;
}

export interface IBookMatch {
  consumerId: number;
  producerId: number;
  amount: number;
  price: number;
}

export class Book {
  private sellMap: Map<number, Set<IBookEntry>>;
  private buyMap: Map<number, Set<IBookEntry>>;

  constructor() {
    this.sellMap = new Map();
    this.buyMap = new Map();
  }

  addEntry(price: number, entry: IBookEntry) {
    const targetMap = entry.amount > 0 ? this.sellMap : this.buyMap;

    if (!targetMap.has(price)) {
      targetMap.set(price, new Set());
    }

    targetMap.get(price).add(entry);
  }

  getEntries(type: "sell" | "buy", price: number) {
    if (type === "sell") {
      return Array.from(this.sellMap.get(price) ?? new Set<IBookEntry>());
    }

    return Array.from(this.buyMap.get(price) ?? new Set<IBookEntry>());
  }

  getPrices(type: "sell" | "buy") {
    if (type === "sell") {
      return Array.from(this.sellMap.keys());
    }

    return Array.from(this.buyMap.keys());
  }

  match() {
    const matches = new Array<IBookMatch>();
    const sortByAmountAsc = (e1: IBookEntry, e2: IBookEntry) => e2.amount - e1.amount;
    const sortByAmountDesc = (e1: IBookEntry, e2: IBookEntry) => e1.amount - e2.amount;

    for (const buyPrice of this.getPrices("buy")) {
      const buyEntries = this.getEntries("buy", buyPrice).sort(sortByAmountDesc);
      const sellEntries = this.getEntries("sell", buyPrice).sort(sortByAmountAsc);

      for (const buyEntry of buyEntries) {
        for (const sellEntry of sellEntries) {
          if (buyEntry.amount === 0) {
            break;
          }

          const suppliedAmount = Math.min(sellEntry.amount, -buyEntry.amount);

          if (suppliedAmount === 0) {
            continue;
          }

          buyEntry.amount += suppliedAmount;
          sellEntry.amount -= suppliedAmount;

          matches.push({
            amount: suppliedAmount,
            price: buyPrice,
            consumerId: buyEntry.userId,
            producerId: sellEntry.userId,
          });
        }

        if (buyEntry.amount !== 0) {
          matches.push({
            amount: buyEntry.amount,
            price: 1.2,
            consumerId: buyEntry.userId,
            producerId: -1,
          });
          buyEntry.amount = 0;
        }
      }
    }

    for (const sellPrice of this.getPrices("sell")) {
      const sellEntries = this.getEntries("sell", sellPrice);

      for (const sellEntry of Array.from(sellEntries).filter((e) => e.amount !== 0)) {
        matches.push({
          amount: sellEntry.amount,
          price: 1.2, //TODO: Dynamic public grid price
          consumerId: -1, //TODO: Constant representing public grid
          producerId: sellEntry.userId,
        });
        sellEntry.amount = 0;
      }
    }

    return matches;
  }

  static createFrom(measurements: IMeasure[], prices: IPrices[]) {
    const book = new Book();

    for (const { userId, value } of measurements) {
      const { buyPrice, sellPrice } = prices.find((p) => p.userId === userId);
      book.addEntry(value > 0 ? sellPrice : buyPrice, { userId, amount: value });
    }

    return book;
  }
}
