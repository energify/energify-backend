import { IPrices } from "src/users/interfaces/iprices.interface";
import { IMeasure } from "../interfaces/imeasure.interface";
import { Book } from "./book.model";

describe("Book", () => {
  let book: Book;

  const measurement: IMeasure[] = [
    { userId: 1, updatedAt: new Date(), value: 10 },
    { userId: 2, updatedAt: new Date(), value: 10 },
    { userId: 3, updatedAt: new Date(), value: 20 },
    { userId: 4, updatedAt: new Date(), value: -20 },
    { userId: 5, updatedAt: new Date(), value: -5 },
    { userId: 6, updatedAt: new Date(), value: -5 },
    { userId: 7, updatedAt: new Date(), value: -40 },
  ];

  const prices: IPrices[] = [
    { userId: 1, buyPrice: 1.1, sellPrice: 1.15, updatedAt: new Date() },
    { userId: 2, buyPrice: 1.1, sellPrice: 1.13, updatedAt: new Date() },
    { userId: 3, buyPrice: 1.1, sellPrice: 1.13, updatedAt: new Date() },
    { userId: 4, buyPrice: 1.13, sellPrice: 1.15, updatedAt: new Date() },
    { userId: 5, buyPrice: 1.13, sellPrice: 1.15, updatedAt: new Date() },
    { userId: 6, buyPrice: 1.13, sellPrice: 1.17, updatedAt: new Date() },
    { userId: 7, buyPrice: 1.13, sellPrice: 1.17, updatedAt: new Date() },
  ];

  it("should create book from measurments and prices", () => {
    book = Book.createFrom(measurement, prices);

    expect(book.getEntries("sell", 1.13).length).toBe(2);
    expect(book.getEntries("buy", 1.1).length).toBe(3);
  });

  it("should match buyers and sellers", () => {
    const matches = book.match();
    console.log(matches);
    expect(matches.length).toBe(6);
  });
});
