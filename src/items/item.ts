import SteamCommunity from 'steamcommunity';
import { Browser, Page } from 'puppeteer';
import CMarketItem from 'steamcommunity/classes/CMarketItem';
import Product from '../products/product';
import { config } from '../config';

export default abstract class Item extends Object {
    public readonly gameID: number;
    public readonly marketHashName: string;
    private readonly browser: Browser;
    // @ts-ignore
    protected cMarketItem: CMarketItem;
    // @ts-ignore
    public readonly page: Page

    public constructor(gameID: number, marketHashName: string, browser: Browser, currencyCode: string) {
        super();

        this.gameID = gameID;
        this.marketHashName = marketHashName;
        this.browser = browser;

        this.setCMarketItem(gameID, marketHashName, currencyCode);

        browser.newPage().then(async data => {
            (this as any).page = data;

            const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' +
                'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36 OPR/85.0.4341.72';
            await this.page.setUserAgent(userAgent);

            await this.page.waitForTimeout(1000);
            await this.page.goto(`https://steamcommunity.com/market/listings/${this.gameID}/${this.marketHashName}`);

            await this.page.waitForSelector('#pageSize');
            await this.page.waitForTimeout(1000);
            await this.page.select('#pageSize', '100');
            await this.page.waitForTimeout(5000);
        });
    }

    private setCMarketItem(gameID: number, marketHashName: string, currencyCode: string) {
        new Promise(function (resolve: (value: CMarketItem) => void, reject) {
            new SteamCommunity().getMarketItem(gameID, marketHashName,
            currencyCode, (err: any, item: CMarketItem) => {
                if (err) {
                    throw err;
                }

                resolve(item);
            });
        }).then(item => {
            this.cMarketItem = item;
        });
    }

    public abstract isProductWorthToTake(product: Product | undefined): boolean;

    public get highestBuyOrder() {
        return this.cMarketItem.highestBuyOrder / 100;
    }

    public abstract get maxPriceToBuy(): number;

    public abstract get type(): string;
};
