import { Browser } from "puppeteer";
import Item from "./items/item";
import FloatItem from "./items/floatitem";
import SeedItem from "./items/seeditem";
import ItemToOrder from "./items/itemtoorder";
import { config } from "./config";
import fs from "fs";

const jsonFileName: string = './data.json';

interface JsonData {
    floatSkins: FloatSkin[];
    seedSkins:  SeedSkin[];
    orderSkins: OrderSkin[];
}

interface FloatSkin {
    game_id:                number;
    market_hash_name:       string;
    maxPercentageOfAutoBuy: number;
    maxFloatToBuy:          number;
}

interface SeedSkin {
    game_id:                number;
    market_hash_name:       string;
    maxPercentageOfAutoBuy: number;
    seedsToBuy:             number[];
}

interface OrderSkin {
    game_id:                number;
    market_hash_name:       string;
    minimalProfit:          number;
    delta:                  number;
}

export default function getItems(browser: Browser) {
    return new Promise<Item[]>(function (resolve: (value: Item[]) => void, reject) {
        fs.readFile(jsonFileName, async (err, data) => {
            let jsonData: JsonData = await JSON.parse(data.toString());
            if (err) {
                throw err;
            }            
            
            let items: Item[] = [];

            if (process.argv[2] === 'order') {
                for await (let element of jsonData.orderSkins) {
                    let newItem = new ItemToOrder(element.game_id, element.market_hash_name,
                        browser, config.currencyCode.toString(), element.minimalProfit, element.delta);
                    items.push(newItem);
    
                    await sleep(1500);
                }
            }
            else if (process.argv[2] === 'buy') {
                for await (let element of jsonData.floatSkins) {
                    let newItem = new FloatItem(element.game_id, element.market_hash_name,
                        browser, config.currencyCode.toString(), element.maxPercentageOfAutoBuy, element.maxFloatToBuy);
                    items.push(newItem);
    
                    await sleep(1500);
                }
    
                for await (let element of jsonData.seedSkins) {
                    let newItem = new SeedItem(element.game_id, element.market_hash_name,
                        browser, config.currencyCode.toString(), element.maxPercentageOfAutoBuy, element.seedsToBuy);
                    items.push(newItem);
    
                    await sleep(1500);
                }
            }

            let pages = await browser.pages();
            pages.at(0)!.close();

            await sleep(5000);

            resolve(items);
        });
    });
}

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
