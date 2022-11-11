import { error } from "console";
import { Page } from "puppeteer";

export default class Product {
    private readonly id: string;
    private readonly page: Page;
    public readonly buyButtonSelector: string;
    // @ts-ignore
    public readonly price: number;
    // @ts-ignore
    public readonly float: number;
    // @ts-ignore
    public readonly seed: number;
    
    constructor(id: string, page: Page) {
        this.id = id;
        this.page = page;
        this.buyButtonSelector = `#listing_${id} > div.market_listing_price_listings_block > div.market_listing_right_cell.market_listing_action_buttons > div > a`;
        this.getPrice().then(data => (this as any).price = data);
        this.getFloat().then(data => (this as any).float = data);
        this.getSeed().then(data => (this as any).seed = data);
    }

    private async getPrice() {
        const selector = `#listing_${this.id} > div.market_listing_price_listings_block > div.market_listing_right_cell.market_listing_their_price > span > span.market_listing_price.market_listing_price_with_fee`;

        await this.page.waitForSelector(selector);

        let priceResult = await this.page.$eval(selector, el => el.innerHTML);
        priceResult.trim().replace(',', '.');

        await this.page.waitForTimeout(500);

        let price = priceResult.match(/\d+(\.\d+)?/g)?.at(0);

        if (typeof (price) === 'string') {
            return Number.parseFloat(price);
        }
        else {
            throw new EvalError("Can not parse price");
        }
    }

    private async getFloat() {
        const selector = `#item_${this.id}_floatdiv > div.csgofloat-itemfloat`;

        await this.page.waitForSelector(selector);

        let floatResult = await this.page.$eval(selector, el => el.innerHTML);
        await this.page.waitForTimeout(500);

        let float = Number.parseFloat(floatResult.trim().replace('Float: ', ''));

        return float;
    }

    private async getSeed() {
        const selector = `#item_${this.id}_floatdiv > div.csgofloat-itemseed`;

        await this.page.waitForSelector(selector);

        let seedResult = await this.page.$eval(selector, el => el.innerHTML);
        await this.page.waitForTimeout(500);

        let seed = Number.parseFloat(seedResult.trim().replace('Paint Seed: ', ''));

        return seed;
    }
};