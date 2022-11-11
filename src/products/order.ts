import Item from "../items/item";
import colors from 'colors';
import { config } from "../config";

export default class Order {
    private _isCreated: boolean;
    private _price: number;
    public readonly item: Item;
    private readonly _acceptSSAIfNeeded: (item: Item) => void;
    
    constructor(firstPrice: number, item: Item, acceptSSAIfNeeded: (item: Item) => void) {
        this._isCreated = false;
        this._price = firstPrice;
        this._acceptSSAIfNeeded = acceptSSAIfNeeded;

        this.item = item;

        this.create(firstPrice);
    }
    
    public get price(): number {
        return this._price;
    }

    public get isCreated(): boolean {
        return this._isCreated;
    }
    
    private async create(price: number) {
        let orderSelector = '#market_buyorder_info > div:nth-child(1) > div:nth-child(1) > a > span';

        await this.item.page.waitForSelector(orderSelector);
        await this.item.page.waitForTimeout(1000);
        await this.item.page.click(orderSelector);
        await this.item.page.waitForTimeout(1000);

        let inputPriceSelector = '#market_buy_commodity_input_price';

        await this.item.page.waitForSelector(inputPriceSelector);
        await this.typeInput(inputPriceSelector, price);
        await this.item.page.waitForTimeout(1000);

        await this._acceptSSAIfNeeded(this.item);

        let purchaseSelector = '#market_buyorder_dialog_purchase';

        await this.item.page.waitForTimeout(200);
        await this.item.page.waitForSelector(purchaseSelector);
        await this.item.page.click(purchaseSelector);
        await this.item.page.waitForTimeout(1000);

        await this.item.page.reload();
    }

    private async typeInput(selector: string, data: number) {
        await this.item.page.click(selector);

        await this.item.page.keyboard.down('ControlLeft');
        await this.item.page.keyboard.press('KeyA');
        await this.item.page.keyboard.press('Backspace');

        await this.item.page.keyboard.up('ControlLeft');

        await this.item.page.type(selector, data.toString(), {
            delay: config.typingDelay
        });
    }

    public async top(delta: number) {
        if (this.item.highestBuyOrder > this._price) {
            await this.cancel();
            await this.create(this._price + delta);
        }
    }

    public async cancel() {
        if (!this._isCreated) {
            console.log("Can not cancel order, it's already canceled".blue);
            return;
        }
        
        let cancelSelector = 'div.market_listing_edit_buttons.actual_content > div > a';

        await this.item.page.waitForSelector(cancelSelector);
        await this.item.page.waitForTimeout(1000);
        await this.item.page.click(cancelSelector);
        await this.item.page.waitForTimeout(1000);
    }
}