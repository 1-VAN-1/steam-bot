import { Browser } from "puppeteer";
import Item from "./item";
import { config } from "../config";
import Product from "../products/product";

export default class ItemToOrder extends Item {
    private readonly minimalProfit: number;
    public readonly delta: number;

    constructor(gameID: number, marketHashName: string, browser: Browser, currencyCode: string,
        minimalProfit: number, delta: number) {
        super(gameID, marketHashName, browser, currencyCode);
        this.minimalProfit = minimalProfit;
        this.delta = delta;
    }

    public override isProductWorthToTake(product: Product | undefined): boolean {
        return this.maxPriceToBuy <= this.highestBuyOrder; 
    }

    public get maxPriceToBuy(): number {
        this.cMarketItem.updatePrice(config.currencyCode.toString());
        return (this.cMarketItem.lowestPrice * (1 - config.steamFee / 100)) - this.minimalProfit;
    }

    public override get highestBuyOrder(): number {
        this.cMarketItem.updatePrice(config.currencyCode.toString());
        return this.cMarketItem.highestBuyOrder / 100;
    }

    public get type(): string {
        return "ItemToOrder";
    }
}
