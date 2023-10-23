

class ConfigInfo
{
    constructor()
    {
        this.accountName = 0;
        this.password = 0;
    }
}

import { readFile, writeFile, readFileSync, writeFileSync} from 'fs';

export function parseConfig(path, callback)
{
    
    readFile(path, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
    
        let lines = data.split("\n");
        let configInfo = new ConfigInfo();

        for(let line of lines)
        {
            if(!line)
                continue;

            let split = line.indexOf(':');

            let info = [line.slice(0,split), line.slice(split+1)];

            configInfo[info[0]]= info[1];
            
        }
        
        
        callback(configInfo);
    });
}


    // steamID:[U:1:143281396]
    // {
    //     "universe": 1,
    //     "type": 1,
    //     "instance": 1,
    //     "accountid": 143281396
    // }

export function steamIdToString(steamID) {
    return "[U:" + steamID.universe + ":" + steamID.accountid + "]";
}


// export function saveRefreshToken(token) {
//     writeFile("./cache/token", token, function(err) {
//         if(err) {
//             console.log(err);
//             return;
//         }
//     }); 
// }

import { existsSync, unlinkSync, appendFileSync} from 'fs';

// export function readRefreshToken() {
//     if(existsSync("./cache/token"))
//         return readFileSync("./cache/token", 'utf8');
//     return "empty";
// }

// export function saveTradeUrl(url) {
//     writeFile("./cache/url", url, function(err) {
//         if(err) {
//             console.log(err);
//             return;
//         }
//     }); 
// }

// export function removeTradeUrl()
// {
//     if(existsSync("./cache/url"))
//         unlinkSync("./cache/url");
// }

// export function readTradeUrl() {
//     if(existsSync("./cache/url"))
//         return readFileSync("./cache/url", 'utf8');
//     return "empty";
// }

export function checkForConfig() {
    if(!existsSync("./config.conf"))
        writeFileSync("./config.conf", "accountName:\npassword:\n");
}


import { mkdirSync } from 'fs';

export function checkForCacheDir() {
    if(!existsSync("./cache"))
        mkdirSync("./cache");
}

// export function readLastCommand() {
//     if(existsSync("./cache/last_command"))
//         return readFileSync("./cache/last_command", 'utf8');
//     return "empty";
// }

// export function saveLastCommand(command) {
//     writeFileSync("./cache/last_command", command);
//}

export function readManual() {
    if(existsSync("./man"))
        return readFileSync("./man", 'utf8');
    return "empty";
}

// export function cacheFailedOffer(command) {
//     writeFileSync("./cache/failed_command", command);
// }

// export function readFailedOffer()
// {
//     if(existsSync("./cache/failed_command"))
//         return readFileSync("./cache/failed_command", 'utf8');
//     return "empty";
// }

// export function removeFailedOffer()
// {
//     if(existsSync("./cache/failed_command"))
//         unlinkSync("./cache/failed_command");
// }

export const FileNames = {
    FailedOffer: 'failed_offer',
    LastTradeURL: 'last_trade_url',
    LastCommand: 'last_command',
    RefreshToken: 'refresh_token',
    CommandHistory: 'history',
  };


export function getCommandHistoryLength()
{
    if(existsSync("./cache/history")) {
        const history = readFileSync("./cache/history", 'utf8');
        let commandTable = history.split(/\r?\n/);
        return commandTable.length;
    }
    return 0;
}


export function readCommandHistory(commandNumber)
{
    if(existsSync("./cache/history")) {
        const history = readFileSync("./cache/history", 'utf8');
        let commandTable = history.split(/\r?\n/);
        if(commandNumber < commandTable.length) {
            let output = commandTable[commandTable.length - commandNumber - 1];
            return output;
        }

    }
    return "";
}

export function appendToCommandHistory(command) {
    if(existsSync("./cache/history")) {
        appendFileSync("./cache/history", "\n" + command);
        return;
    }

    writeFileSync("./cache/history", command);
}

export function deleteCacheFile(path) {
    if(existsSync("./cache/" + path))
        unlinkSync("./cache/" + path);
}

export function readCacheFile(path) {
    if(existsSync("./cache/" + path))
        return readFileSync("./cache/" + path, 'utf8');
    return "empty";
}

export function saveToCacheFile(path, text) {
    writeFileSync("./cache/" + path, text);
}