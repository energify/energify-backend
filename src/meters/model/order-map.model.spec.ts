import { IPrices } from "src/users/interfaces/iprices.interface";
import { IMeasure } from "../interfaces/imeasure.interface";
import { OrderMap } from "./order-map.model";

describe("OrderMap", () => {
  const prices: IPrices[] = [
    { buyPrice: 40, sellPrice: 1.13, userId: 1, updatedAt: new Date() },
    { buyPrice: 1.12, sellPrice: 1.13, userId: 2, updatedAt: new Date() },
    { buyPrice: 1.12, sellPrice: 1.13, userId: 3, updatedAt: new Date() },
    { buyPrice: 1.12, sellPrice: 1.13, userId: 4, updatedAt: new Date() },
    { buyPrice: 1.12, sellPrice: 1.13, userId: 5, updatedAt: new Date() },

    { buyPrice: 0.96, sellPrice: 1.11, userId: 6, updatedAt: new Date() },
    { buyPrice: 1.14, sellPrice: 1.14, userId: 7, updatedAt: new Date() },
    { buyPrice: 1.11, sellPrice: 1.14, userId: 8, updatedAt: new Date() },
    { buyPrice: 1.12, sellPrice: 1.12, userId: 9, updatedAt: new Date() },
    { buyPrice: 1.16, sellPrice: 1.15, userId: 10, updatedAt: new Date() },
  ];
  const measurement: IMeasure[] = [
    { value: 40, userId: 1, updatedAt: new Date() },
    { value: 10, userId: 2, updatedAt: new Date() },
    { value: 20, userId: 3, updatedAt: new Date() },
    { value: -15, userId: 4, updatedAt: new Date() },
    { value: -10, userId: 5, updatedAt: new Date() },

    { value: 20, userId: 6, updatedAt: new Date() },
    { value: -5, userId: 7, updatedAt: new Date() },
    { value: -2.4, userId: 8, updatedAt: new Date() },
    { value: 4.8, userId: 9, updatedAt: new Date() },
    { value: 3, userId: 10, updatedAt: new Date() },
  ];

  it("", () => {
    const orderMap = new OrderMap(prices, measurement);
    orderMap.match();
  });
});
