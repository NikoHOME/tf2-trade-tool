
import { Currencies } from "./metal.js";

export class TradeVariables
{
    constructor()
    {
        this.offer;
        this.clientCurrencies = new Currencies();
        this.ownCurrencies = new Currencies();
        this.ownInventory;
        this.clientInventory;

        this.clientTradeLink;
        this.gameAppID = 440 //Team Fortress 2
        this.inventoryContext = 2; //Steam default
        this.mySid;

        this.readLine;
        this.metalManager;
        this.dealManager;
        this.tradeManager;
        this.eventEmitter;
    }
}
