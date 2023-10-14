
import SteamCommunity from 'steamcommunity'
import SteamUser from 'steam-user';

let SteamID = SteamCommunity.SteamID;


import { ProgramMemory } from './src/memory.js';

let programMemory = new ProgramMemory();

programMemory.community = new SteamCommunity();
programMemory.user = new SteamUser();


import { EventEmitter } from 'node:events';

programMemory.eventEmitter = new EventEmitter();

import * as Readline from 'node:readline/promises';

programMemory.readLine = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


import { MetalManager } from './src/metal.js';
import { DealManager } from "./src/deal.js"

programMemory.dealManager = new DealManager();
programMemory.metalManager = new MetalManager();



import {parseConfig, checkForConfig, checkForCacheDir} from './src/file.js'

checkForConfig();
checkForCacheDir();

parseConfig("./config.conf", parseCallback);

function parseCallback(parsedInfo)
{
    loginToSteam(parsedInfo);
}


function readSteamGuardCode(steamGuardCode)
{
    programMemory.readLine.setPrompt('Steam Guard Code: ');
    programMemory.readLine.prompt();

    programMemory.readLine.on('line', (code) => {
        programMemory.readLine.removeAllListeners("line");
        steamGuardCode.value = code;
        process.emit("steamGuardLogin");
    });
}


// function steamLoginCallback(err)
// {   
//     if(err)
//     {
//         console.log(err);
//         console.log("Login Failed");
//         process.emit("steamGuardRetry");
//         return;
//     }
    
//     process.emit("steamLogin");
// }


import { steamIdToString } from './src/file.js';
import TradeOfferManager from 'steam-tradeoffer-manager';
import { readInput } from './src/input.js';


class SteamGuardCode
{
    constructor ()
    {
        this.value = 0;
    }
}

import { saveRefreshToken, readRefreshToken} from './src/file.js';

function loginToSteam(parsedInfo, session)
{   
    let steamGuardCode = new SteamGuardCode();
    // const maxLoginRetries = 5;
    // let loginRetries = 0;

    

    if(!parsedInfo.accountName || !parsedInfo.password)
    {
        console.log("Missing account info in config.conf file");
        process.exit(1);
    }

    let token = readRefreshToken();

    if(token == "empty")
    {
        readSteamGuardCode(steamGuardCode);
    }
    else
    {
        programMemory.token = token;
        programMemory.user.logOn({
            refreshToken: token,
            rememberPassword: true,
        });
    }


    programMemory.user.on("loginKey", function(token) {
        programMemory.token = token;
        saveRefreshToken(token);
    });

    process.on("steamGuardLogin", () => {
        programMemory.user.logOn({
            accountName: parsedInfo.accountName,
            password: parsedInfo.password,
            twoFactorCode: steamGuardCode.value,
            rememberPassword: true,
        });
    });

    programMemory.user.on("accountInfo", function(name) {
        console.log("<++> Successfully logged on as \'" + name +"\'" );
        programMemory.user.removeAllListeners("accountInfo");
        startTradeManager(programMemory)
    });

    // programMemory.user.on("loggedOn", function() {
    //     console.log("<++> Successfully logged on as " + programMemory.user.accountInfo);
        
    // });

    programMemory.user.on("webSession", function(sessionID, cookies) {
        programMemory.community.setCookies(cookies);
    });

}

function startTradeManager(programMemory)
{
    programMemory.tradeManager = new TradeOfferManager({
        "community": programMemory.community,
        "steam": programMemory.user,
        "language": "en"
    });

    programMemory.mySid = new SteamID(steamIdToString(programMemory.user.steamID));
    readInput(programMemory);
}
















//"https://steamcommunity.com/tradeoffer/new/?partner=238187525&token=HMW9yc2O"; //Artha
//"https://steamcommunity.com/tradeoffer/new/?partner=143281396&token=ZNMHVcS4"; //Niko
