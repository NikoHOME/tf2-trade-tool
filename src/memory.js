
import { Currencies } from "./metal.js";

import SteamCommunity from 'steamcommunity';
import SteamUser from 'steam-user';
import { EventEmitter } from 'node:events';

import * as Readline from 'node:readline/promises';

import { MetalManager } from './metal.js';
import { DealManager } from "./deal.js";

import * as file from "./file.js";

import TradeOfferManager from 'steam-tradeoffer-manager';
import { startPrompt } from './input.js';


class SteamGuardCode
{
    constructor ()
    {
        this.value = 0;
    }
}

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
        this.readLine = Readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            history: file.readCacheFile(file.FileNames.CommandHistory).split(/\r?\n/).reverse(),
        });
        this.metalManager = new MetalManager();
        this.dealManager = new DealManager();
        this.tradeManager;
        this.eventEmitter = new EventEmitter();

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
        this.community = new SteamCommunity();
        this.user = new SteamUser();
    }

    nextCommand() {
        this.readLine.prompt();
        process.stdin.resume();
    }

    startTradeManager()
    {
        this.tradeManager = new TradeOfferManager({
            "community": this.community,
            "steam": this.user,
            "language": "en"
        });

        let SteamID = SteamCommunity.SteamID;
        this.mySid = new SteamID(file.steamIdToString(this.user.steamID));
        startPrompt(this);
    }

    loginToSteam(parsedInfo) {   
        let steamGuardCode = new SteamGuardCode();

        if(!parsedInfo.accountName || !parsedInfo.password) {
            console.log("Missing account info in config.conf file");
            process.exit(1);
        }

        let token = file.readCacheFile(file.FileNames.RefreshToken);

        if(token == "empty") {
            readSteamGuardCode(steamGuardCode);
        }
        else {
            this.token = token;
            this.user.logOn({
                refreshToken: token,
                rememberPassword: true,
            });
        }


        this.user.on("loginKey", function(token) {
            global.programMemory.token = token;
            file.saveToCacheFile(FileNames.RefreshToken, token);
        });

        process.on("steamGuardLogin", (programMemory) => {
            programMemory.user.logOn({
                accountName: parsedInfo.accountName,
                password: parsedInfo.password,
                twoFactorCode: steamGuardCode.value,
                rememberPassword: true,
            });
        });

        this.user.on("accountInfo", function(name) {
            process.emit("accountInfo", this, name);
            global.programMemory.user.removeAllListeners("accountInfo");
            global.programMemory.startTradeManager();
        });

        this.user.on("webSession", function(sessionID, cookies) {
            global.programMemory.community.setCookies(cookies);
        });
    }


    readSteamGuardCode(steamGuardCode) {
        this.readLine.setPrompt('Steam Guard Code: ');
        this.readLine.prompt();

        this.readLine.on('line', (code) => {
            this.readLine.removeAllListeners("line");
            steamGuardCode.value = code;
            process.emit("steamGuardLogin");
        });
    }

    startProgram() {
        file.checkForConfig();
        file.checkForCacheDir();

        let parsedInfo = file.parseConfig("./config.conf");
        this.loginToSteam(parsedInfo);
    }
}
