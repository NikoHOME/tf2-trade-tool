


import { spawnSync } from "child_process"

export function restartProgram() {
    process.on("exit", function () {
        //  Resolve the `child_process` module, and `spawn`
        //  a new process.
        //  The `child_process` module lets us
        //  access OS functionalities by running any bash command.`.
        spawnSync(
            process.argv.shift(),
            process.argv,
            {
                cwd: process.cwd(),
                detached: true,
                stdio: "inherit"
            }
        );
    });
    process.exit(0);

}

import * as file from "./file.js";

function exitProgram() {
    file.deleteCacheFile(file.FileNames.LastTradeURL);
    file.deleteCacheFile(file.FileNames.LastCommand);
    file.deleteCacheFile(file.FileNames.FailedOffer);
    process.exit(0);
}

function addReadLineEvent(programMemory)
{
    programMemory.readLine.on('line', (command) => {
        process.stdin.pause(); // Pause key listeners during execution
        programMemory.currentHistoryIndex = 0; // Reset history index for built in
                                               // promt history support to work with cache files
        let args = command.split(" ");
        file.appendToCommandHistory(command);

        switch(args[0]) {   
            case "new":
                restartProgram();
                break;
            case "fetch":
                fetch(programMemory); //emits fetchEnded
                break;
            case "deal":
                if(programMemory.offer == null) {
                    console.log("<!!> No client specified use the url command");
                    programMemory.nextCommand()
                    break;
                }
                programMemory.dealManager.dealCase(args, programMemory); //emits offerSent
                break;
            case "url":
                if(args.length > 1) {
                    file.deleteCacheFile(file.FileNames.FailedOffer); //reset previously failed offer as it's a different user
                    programMemory.clientTradeLink = args[1];
                    programMemory.offer = programMemory.tradeManager.createOffer(programMemory.clientTradeLink);
                    file.saveToCacheFile(file.FileNames.LastTradeURL, args[1]);
                    fetch(programMemory); //emits fetchEnded
                    break;
                }
                console.log("<!!> Missing client trade link");
                programMemory.nextCommand()
                break;
            case "exit":
                exitProgram();
                break;
            case "help":
                let manual = file.readManual();
                console.log(manual);
                programMemory.nextCommand()
                break;
            default:
                console.log("<??> Unknown command, type help for help");
                programMemory.nextCommand()
        }
    });
}

import { fetch, addFetchListeners } from "./fetch.js";

export function readInput(programMemory) {

    programMemory.readLine.setPrompt('$ Command: ');
    addFetchListeners(programMemory);
    addReadLineEvent(programMemory);
    
    
    let savedUrl = file.readCacheFile(file.FileNames.LastTradeURL); //Check if we saved the trade link before exiting

    if(savedUrl != "empty") {
        programMemory.clientTradeLink = savedUrl;
        programMemory.offer = programMemory.tradeManager.createOffer(programMemory.clientTradeLink);
        fetch(programMemory);
    }
    else {
        programMemory.nextCommand()
    }

    
    //Check if offer failed and save it in the cache before the reset
    process.on("offerSent", (error) => {
        if(error) {
            console.log(error);
            console.log("<!!> Offer Error");
            file.saveToCacheFile(file.FileNames.FailedOffer,file.readCacheFile(file.FileNames.LastCommand));
            restartProgram();
            return;
        }
        file.deleteCacheFile(file.FileNames.FailedOffer);
        file.deleteCacheFile(file.FileNames.RetryCounter);
        console.log("<++> Offer Sent");
        restartProgram();
    });

    process.on("fetchEnded", () => {
        console.log("<++> Inventory fetch ended");
        // Check if the last offer failed before the restart
        let failedOffer = file.readCacheFile(file.FileNames.FailedOffer); 
        
        if(failedOffer != "empty") {
            file.incrementOfferRetryCounter();
            let retryCounter = file.readCacheFile(file.FileNames.RetryCounter);

            if(parseInt(retryCounter) > 3) {
                console.log("<||> Retry limit exceeded aborting");
                programMemory.nextCommand()
                return;
            }
            console.log("<++> (" + retryCounter + ") Retrying offer: " + "\'" + failedOffer + "\'");
            
            programMemory.readLine.emit("line", failedOffer);
            return;
        }

        programMemory.nextCommand()
    });
   
   
}
