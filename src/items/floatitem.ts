import { Browser } from "puppeteer";
import Product from "../products/product";
import ItemToBuy from "./itemtobuy";

export default class FloatItem extends ItemToBuy {
    public readonly maxFloatToBuy: number;

    constructor(gameID: number, marketHashName: string, browser: Browser, currencyCode: string,
        maxPercentageOfAutoBuy: number, maxFloatToBuy: number) {
        super(gameID, marketHashName, browser, currencyCode, maxPercentageOfAutoBuy);
        this.maxFloatToBuy = maxFloatToBuy;
    }

    public override isProductWorthToTake(product: Product | undefined): boolean {
        if (typeof (product) !== 'undefined') {
            return product.float <= this.maxFloatToBuy;
        }
        else {
            throw new TypeError("Product is undefined");
        }
    }

    public get type(): string {
        return "FloatItem";
    }
}