

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


import { existsSync, unlinkSync, appendFileSync, mkdirSync} from 'fs';

export const FileNames = {
    FailedOffer: 'failed_offer',
    LastTradeURL: 'last_trade_url',
    LastCommand: 'last_command',
    RefreshToken: 'refresh_token',
    CommandHistory: 'history',
};

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

export function checkForConfig() {
    if(!existsSync("./config.conf"))
        writeFileSync("./config.conf", "accountName:\npassword:\n");
}

export function checkForCacheDir() {
    if(!existsSync("./cache"))
        mkdirSync("./cache");
}


export function readManual() {
    if(existsSync("./man"))
        return readFileSync("./man", 'utf8');
    return "empty";
}



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

