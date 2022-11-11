import Item from "../items/item";
import Bot from "./bot";
import colors from 'colors';
import Order from "../products/order";
import ItemToOrder from "../items/itemtoorder";

export default class BotOrderManager extends Bot {
    private orders: Map<Item, Order>;

    constructor(requestIntervalInMinutes: number, items: Item[]) {
        super(requestIntervalInMinutes, items);

        this.orders = new Map();
    }

    protected override async checkItem(item: Item) {
        console.log(("OrderManager -- Started with: " + item.page.url()).blue);

        await item.page.reload();
        await item.page.bringToFront();
    
        console.log(('OrderManager -- Max price to buy: ' + item.maxPriceToBuy.toPrecision(4)).blue);

        if (item.isProductWorthToTake(undefined)) {
            if (!this.isOrderCreated(item)) {
                this.orders.set(item, await this.createOrder(item));
            }
            else {
                this.orders.get(item)!.top((item as ItemToOrder).delta);
            }
        }
        else {
            console.log('OrderManager -- Skip item'.blue);

            if (this.isOrderCreated(item)) {
                this.orders.get(item)!.cancel();
                this.orders.delete(item);
            }
        }
    }

    private isOrderCreated(item: Item): boolean {
        return this.orders.has(item);
    }

    private async createOrder(item: Item) {
        return new Order(item.highestBuyOrder + (item as ItemToOrder).delta, item, this.acceptSSAIfNeeded);
    }
}