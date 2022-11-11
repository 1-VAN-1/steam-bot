import fs from 'fs';
import puppeteer, { Browser, CustomError } from 'puppeteer';
import readline from 'readline';
import { config } from './config';
import Item from './items/item';
import BotCustomer from './bots/botcustomer';
import getItems from './json';
import ItemToBuy from './items/itemtobuy';
import BotOrderManager from './bots/botordermanager';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

main();

async function main() {
    console.log(process.argv[2]);

    const customArgs = [
        `--start-maximized`,
        `--load-extension=${config.floatCheckerPath}`
    ];

    let browser = await puppeteer.launch({
        defaultViewport: null,
        headless: config.headless,
        ignoreDefaultArgs: ["--disable-extensions"],
        args: customArgs
    });

    let items = await getItems(browser);

    console.log("Items:");
    items.forEach(element => {
        console.log(element.marketHashName, element.highestBuyOrder);
    });

    let bots = {
        customer: new BotCustomer(config.requestIntervalInMinutesBuy, items.filter(element => {
            return element.type === 'FloatItem' || element.type === 'SeedItem';
        })),

        orderManager: new BotOrderManager(config.requestIntervalInMinutesOrder, items.filter(element => {
            return element.type === 'ItemToOrder';
        }))
    };

    rl.question('Log in and type anything', answer => {
        if (process.argv[2] === 'order') {
            bots.orderManager.start();
        }
        else if (process.argv[2] === 'buy') {
            bots.customer.start();
        }
    });
}
