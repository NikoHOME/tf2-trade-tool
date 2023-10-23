
import { Currencies } from "./metal.js";

export class ProgramMemory
{
    constructor() {
        this.offer = null;
        this.clientCurrencies = new Currencies();
        this.ownCurrencies = new Currencies();
        this.ownInventory;
        this.clientInventory;

        this.clientTradeLink;
        this.gameAppID = 440 //Team Fortress 2
        this.inventoryContext = 2; //Steam default
        this.currentHistoryIndex = 0; // Command history picker
        this.mySid;

        this.readLine;
        this.metalManager;
        this.dealManager;
        this.tradeManager;
        this.eventEmitter;


        this.token;
        this.community;
        this.user;
    }

    nextCommand() {
        this.readLine.prompt();
        process.stdin.resume();
    }
}
