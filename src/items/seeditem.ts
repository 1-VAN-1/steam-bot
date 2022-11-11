import { Browser } from "puppeteer";
import Product from "../products/product";
import ItemToBuy from "./itemtobuy";

export default class SeedItem extends ItemToBuy {
    public readonly affordableSeeds: number[];

    constructor(gameID: number, marketHashName: string, browser: Browser, currencyCode: string,
        maxPercentageOfAutoBuy: number, affordableSeeds: number[]) {
        super(gameID, marketHashName, browser, currencyCode, maxPercentageOfAutoBuy);
        this.affordableSeeds = affordableSeeds;
    }

    public override isProductWorthToTake(product: Product | undefined): boolean {
        if (typeof (product) !== 'undefined') {
            return this.affordableSeeds.includes(product.seed);
        }
        else {
            throw new TypeError("Product is undefined");
        }
    }

    public get type(): string {
        return "SeedItem";
    }
}