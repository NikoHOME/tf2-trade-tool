
import { Currencies } from "./metal.js";

export class ProgramMemory
{
    constructor() {
        

        this.clientTradeLink;
        // Game ID of Team Fortress 2
        this.gameAppID = 440
        // Steam default inventory
        // context for trading used
        // for Steam trade manager package
        this.inventoryContext = 2;
        // Variable for reversing built-in 
        // promt history to work with 
        // own cache file
        this.currentHistoryIndex = 0; 
        this.mySid;

        // Complex classes
        this.readLine;
        this.metalManager;
        this.dealManager;
        this.tradeManager;
        this.eventEmitter;

        // Current offfer variables
        // used in dealManager
        this.offer = null;
        this.clientCurrencies = new Currencies();
        this.ownCurrencies = new Currencies();
        this.ownInventory;
        this.clientInventory;

        // Variables for creating
        // and managing sessions
        this.token;
        this.community;
        this.user;
    }

    nextCommand() {
        this.readLine.prompt();
        process.stdin.resume();
    }
}
