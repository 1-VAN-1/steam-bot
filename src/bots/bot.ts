import Item from '../items/item';
import readline from 'readline';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export default abstract class Bot {
    public readonly requestIntervalInMinutes: number;
    public readonly items: Array<Item>;
    private isBuying: boolean;
    protected isSSAAccepted: boolean;

    public constructor(requestIntervalInMinutes: number, items: Array<Item>) {
        this.requestIntervalInMinutes = requestIntervalInMinutes;
        this.items = items;
        this.isBuying = false;
        this.isSSAAccepted = false;
    }

    private sleep(ms: number): Promise<unknown> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
    
    private minToMs(minutes: number): number {
        return minutes * 60000;
    }

    protected async acceptSSAIfNeeded(item: Item): Promise<void> {
        if (this.isSSAAccepted) {
            return;
        }

        let checkboxSelector = '#market_buynow_dialog_accept_ssa';

        await item.page.waitForSelector(checkboxSelector);
        await item.page.waitForTimeout(200);
        await item.page.click(checkboxSelector);

        this.isSSAAccepted = true;

        await item.page.waitForTimeout(200);
    }

    protected abstract checkItem(item: Item): void;

    public async start(): Promise<void> {
        console.log("Bot's started buying");

        if (this.items.length === 0) {
            console.log("There's nothing to buy, stopping...");
            return;
        }

        this.isBuying = true;

        while (this.isBuying) {
            console.log("\nStarting next loop\n");
    
            for await (let item of this.items) {
                await this.checkItem(item);
                await this.sleep(500);

                if (!this.isBuying) {
                    break;
                }
            }
    
            console.log("\nLoop ended");
    
            await this.sleep(this.minToMs(this.requestIntervalInMinutes));
        }
    }

    public stop(): void {
        this.isBuying = false;
        console.log("Bot stopped");

        rl.question('Type anything to start bot', answer => {
            this.start();
        });
    }
};