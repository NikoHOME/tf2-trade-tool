

class ConfigInfo
{
    constructor()
    {
        this.accountName = 0;
        this.password = 0;
    }
}

import { readFile } from 'fs';

export function parseFile(path, callback)
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

export function steamIdToString(steamID)
{


    return "[U:" + steamID.universe + ":" + steamID.accountid + "]";

    // {
    //     "universe": 1,
    //     "type": 1,
    //     "instance": 1,
    //     "accountid": 143281396
    // }

    // steamID:[U:1:143281396]
}

