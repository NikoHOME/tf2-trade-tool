
import SteamCommunity from 'steamcommunity'

let SteamID = SteamCommunity.SteamID;
let community = new SteamCommunity();

import { TradeVariables } from './trade_vars.js';

let tradeVariables = new TradeVariables();


import { EventEmitter } from 'node:events';

tradeVariables.eventEmitter = new EventEmitter();

import * as Readline from 'node:readline/promises';

tradeVariables.readLine = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


import { MetalManager } from './metal.js';
import { DealManager } from "./deal.js"

tradeVariables.dealManager = new DealManager();
tradeVariables.metalManager = new MetalManager();



import {parseFile} from './parse.js'

parseFile("./config.conf", parseCallback);

function parseCallback(parsedInfo)
{
    loginToSteam(parsedInfo);
}


function readSteamGuardCode(steamGuardCode)
{
    tradeVariables.readLine.setPrompt('Steam Guard Code: ');
    tradeVariables.readLine.prompt();

    tradeVariables.readLine.on('line', (code) => {
        tradeVariables.readLine.removeAllListeners("line");
        steamGuardCode.value = code;
        process.emit("steamGuardLogin");
    });
}


function communityLoginCallback(err)
{   
    if(err)
    {
        // console.log(err);
        console.log("Login Failed");
        process.emit("steamGuardRetry");
        return;
    }
    
    process.emit("communityLogin");
}


import { steamIdToString } from './parse.js';
import TradeOfferManager from 'steam-tradeoffer-manager';
import { readInput } from './input.js';

class SteamGuardCode
{
    constructor ()
    {
        this.value = 0;
    }
}

function loginToSteam(parsedInfo, session)
{   
    let steamGuardCode = new SteamGuardCode();
    const maxLoginRetries = 5;
    let loginRetries = 0;

    readSteamGuardCode(steamGuardCode);


    process.on("steamGuardRetry", () => {

        if(loginRetries >= maxLoginRetries)
        {
            loginRetries = 0;
            console.log("Login failed after 5 retries")
            readSteamGuardCode(steamGuardCode);
            return;
        }

        loginRetries +=1;
        process.emit("steamGuardLogin");
    });

    process.on("steamGuardLogin", () => {
        community.login({
            accountName: parsedInfo.accountName,
            password: parsedInfo.password,
            twoFactorCode: steamGuardCode.value,
        }, communityLoginCallback);
    });

    process.on("communityLogin", () => {
        tradeVariables.tradeManager = new TradeOfferManager({
            "community": community,
            // "domain": "localhost", // Fill this in with your own domain
            "language": "en"
        });


        tradeVariables.mySid = new SteamID(steamIdToString(community.steamID));
        tradeVariables.clientTradeLink = parsedInfo.tradeURL;
        readInput(tradeVariables);
    });
}
















//"https://steamcommunity.com/tradeoffer/new/?partner=238187525&token=HMW9yc2O"; //Artha
//"https://steamcommunity.com/tradeoffer/new/?partner=143281396&token=ZNMHVcS4"; //Niko
