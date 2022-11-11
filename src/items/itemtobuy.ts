import Item from "./item";
import { Browser } from "puppeteer";
import Product from "../products/product";

export default abstract class ItemToBuy extends Item {
    private readonly maxPercentageOfAutoBuy: number;

    constructor(gameID: number, marketHashName: string, browser: Browser, currencyCode: string,
        maxPercentageOfAutoBuy: number) {
        super(gameID, marketHashName, browser, currencyCode);
        this.maxPercentageOfAutoBuy = maxPercentageOfAutoBuy;
    }

    public override get maxPriceToBuy(): number {
        console.log('Autobuy: ' + this.highestBuyOrder);
    
        let result = this.highestBuyOrder * (1 + this.maxPercentageOfAutoBuy / 100);
    
        return result;
    }
}
