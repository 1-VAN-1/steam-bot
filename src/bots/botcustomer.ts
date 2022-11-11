import Bot from "./bot";
import Item from "../items/item";
import Product from "../products/product";
import { Page } from "puppeteer";
import FloatItem from "../items/floatitem";

export default class BotCustomer extends Bot {
    private itemsIndex: number;

    constructor(requestIntervalInMinutes: number, items: Array<Item>) {
        super(requestIntervalInMinutes, items);
        this.itemsIndex = 0;
    }

    protected override async checkItem(item: Item) {
        console.log(("Customer -- Started with: " + item.page.url()).red);

        await item.page.reload();
        await item.page.bringToFront();
    
        console.log(('Customer -- Max price to buy: ' + item.maxPriceToBuy.toPrecision(4)).red);
    
        await item.page.waitForSelector('#searchResultsRows');
        
        if (item.type === 'FloatItem') {
            await item.page.waitForSelector('#csgofloat_sort_by_float');
            await item.page.waitForTimeout(5000);
            await item.page.click('#csgofloat_sort_by_float');
            await item.page.waitForTimeout(500);
        }

        let idSelector = '.market_listing_item_name';
        await item.page.waitForSelector(idSelector);
        await item.page.waitForTimeout(1000);

        let ids = await item.page.$$eval(idSelector, spans => {
            return [...spans].map(span => {
            return span.outerHTML;
            })
        });
        ids.pop();

        ids = ids.map(element => element.substring(18, 37));

        console.log(ids);

        this.itemsIndex = 0;
        this.isSSAAccepted = false;

        while(this.itemsIndex < ids.length) {
            let product = this.getNextProduct(item.page, ids);

            if (item.type === 'FloatItem' && !item.isProductWorthToTake(product)) {
                break;
            }

            if (item.type === 'SeedItem' &&  !item.isProductWorthToTake(product)) {
                continue;
            }

            if (product.price > item.maxPriceToBuy) {
                continue;
            }

            console.log(`Customer -- Trying to buy product with price ${product.price} and ` +
                `float ${product.float} and paint seed ${product.seed}`.red);

            await this.buyProduct(item, product.buyButtonSelector);
        }

        console.log('Customer -- Item has been processed\n'.red);
    }

    private async buyProduct(item: Item, buyButtonSelector: string) {
        await item.page.waitForTimeout(500);
        await item.page.click(buyButtonSelector);
        await item.page.waitForTimeout(500);

        try {
            await this.acceptSSAIfNeeded(item);

            let selector = '#market_buynow_dialog_purchase';

            await item.page.waitForSelector(selector);
            await item.page.click(selector);
            await item.page.waitForTimeout(1000);
        } catch (error) {
            console.log(error);
            console.log("Customer -- There's no money".red);

            this.stop();
        }

        let closeSelector = 'body > div.newmodal > div.newmodal_header_border > div > div.newmodal_close';

        await item.page.waitForSelector(closeSelector);
        await item.page.click(closeSelector);
        await item.page.waitForTimeout(1000);
    }

    private getNextProduct(page: Page, ids: string[]): Product {
        let id = ids.at(this.itemsIndex)!;

        this.itemsIndex++;

        return new Product(id, page);
    }
};