
import SteamCommunity from 'steamcommunity'
import SteamUser from 'steam-user';

let SteamID = SteamCommunity.SteamID;


import { TradeVariables } from './trade_vars.js';

let tradeVariables = new TradeVariables();

tradeVariables.community = new SteamCommunity();
tradeVariables.user = new SteamUser();


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


function steamLoginCallback(err)
{   
    if(err)
    {
        console.log(err);
        console.log("Login Failed");
        process.emit("steamGuardRetry");
        return;
    }
    
    process.emit("steamLogin");
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

import { saveRefreshToken, readRefreshToken } from './parse.js';

function loginToSteam(parsedInfo, session)
{   
    let steamGuardCode = new SteamGuardCode();
    const maxLoginRetries = 5;
    let loginRetries = 0;


    let token = readRefreshToken();

    if(token == "empty")
    {
        readSteamGuardCode(steamGuardCode);
    }
    else
    {
        tradeVariables.token = token;
        tradeVariables.user.logOn({
            refreshToken: token,
            rememberPassword: true,
        });
    }


    tradeVariables.user.on("loginKey", function(token) {
        tradeVariables.token = token;
        saveRefreshToken(token);
        
        tradeVariables.community.login

    });


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
        tradeVariables.user.logOn({
            accountName: parsedInfo.accountName,
            password: parsedInfo.password,
            twoFactorCode: steamGuardCode.value,
            rememberPassword: true,
        });
    });

    tradeVariables.user.on("loggedOn", function() {
        steamLoginCallback();
        tradeVariables.user.webLogOn();
    });


    process.on("steamLogin", () => {
        // tradeVariables.user.webLogOn();

        tradeVariables.tradeManager = new TradeOfferManager({
            "community": tradeVariables.community,
            "steam": tradeVariables.user,
            // "domain": "localhost", // Fill this in with your own domain
            "language": "en"
        });

        
        
        // tradeVariables.community.getClientLogonToken((err, details) => {
        //     if (err) {
        //         handleErrorSomehow(err);
        //     } else {
        //         tradeVariables.user.logOn(details);
        //     }
        // });

        tradeVariables.mySid = new SteamID(steamIdToString(tradeVariables.user.steamID));
        tradeVariables.user.removeAllListeners("loggedOn");
        readInput(tradeVariables);
    });
}
















//"https://steamcommunity.com/tradeoffer/new/?partner=238187525&token=HMW9yc2O"; //Artha
//"https://steamcommunity.com/tradeoffer/new/?partner=143281396&token=ZNMHVcS4"; //Niko
