


import { spawnSync } from "child_process"


// Steam trader npm package is weird
// it's easier to restart after every
// offer to prevent errors
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
    // Mark this session as correctly exited
    file.saveToCacheFile(file.FileNames.PlannedRestart, "true");
    process.exit(0);
}

import * as file from "./file.js";

// Delete cache files that
// can affect the next sesssion
function exitProgram() {
    file.deleteCacheFile(file.FileNames.LastTradeURL);
    file.deleteCacheFile(file.FileNames.LastCommand);
    file.deleteCacheFile(file.FileNames.FailedOffer);
    process.exit(0);
}

function addReadLineEvent(programMemory)
{
    programMemory.readLine.on('line', (command) => {
        // Pause key listeners during execution
        process.stdin.pause();     
        // Reset history index for built in
        // promt history support to work with cache files             
        programMemory.currentHistoryIndex = 0;  
        let args = command.split(" ");
        file.appendToCommandHistory(command);

        switch(args[0]) {   
            case "new":
                restartProgram();
                break;
            case "fetch":
                // Emits fetchEnded to
                // come back to the prompt after       
                fetch(programMemory); 
                break;
            case "deal":
                if(programMemory.offer == null) {
                    console.log("<!!> No client specified use the url command");
                    programMemory.nextCommand()
                    break;
                }
                // Emits offerSent to
                // come back to the prompt after
                programMemory.dealManager.dealCase(args, programMemory); 
                break;
            case "url":
                if(args.length > 1) {
                    // Delete cache files from
                    // previous trader
                    file.deleteCacheFile(file.FileNames.FailedOffer);
                    programMemory.clientTradeLink = args[1];
                    programMemory.offer = programMemory.tradeManager.createOffer(programMemory.clientTradeLink);
                    file.saveToCacheFile(file.FileNames.LastTradeURL, args[1]);
                    // Emits fetchEnded to
                    // come back to the prompt after   
                    fetch(programMemory); 
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

export function startPrompt(programMemory) {

    // Check if the last session was
    // correctly exited (marked to keep)

    let exitCheck = file.readCacheFile(file.FileNames.PlannedRestart);
    // Remove mark for the next check 
    file.deleteCacheFile(file.FileNames.PlannedRestart);

    // If not marked to keep
    // clean temporary cache
    if(exitCheck == "empty") {
        file.deleteCacheFile(file.FileNames.LastTradeURL);
        file.deleteCacheFile(file.FileNames.LastCommand);
        file.deleteCacheFile(file.FileNames.FailedOffer);
        file.deleteCacheFile(file.FileNames.RetryCounter);
    }

    programMemory.readLine.setPrompt('$ Command: ');
    addFetchListeners(programMemory);
    addReadLineEvent(programMemory);
    
    // Check for the trade link
    // used on the last session
    let savedUrl = file.readCacheFile(file.FileNames.LastTradeURL); 

    if(savedUrl != "empty") {
        programMemory.clientTradeLink = savedUrl;
        programMemory.offer = programMemory.tradeManager.createOffer(programMemory.clientTradeLink);
        fetch(programMemory);
    }
    else {
        programMemory.nextCommand()
    }

    
    // Check if offer failed and 
    // save it in the cache before the reset
    process.on("offerSent", (error) => {
        if(error) {
            // Report the error and save
            // it for the next process
            console.log(error);
            console.log("<!!> Offer Error");
            file.saveToCacheFile(file.FileNames.FailedOffer,file.readCacheFile(file.FileNames.LastCommand));
            restartProgram();
            return;
        }
        // Clean the cache in case
        // for the next failed offfer
        file.deleteCacheFile(file.FileNames.FailedOffer);
        file.deleteCacheFile(file.FileNames.RetryCounter);
        console.log("<++> Offer Sent");
        restartProgram();
    });

    process.on("fetchEnded", () => {
        console.log("<++> Inventory fetch ended");
        // Check if the last offer failed 
        // before the restart to continue it
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
            // Enter failed offer to promt and continue 
            programMemory.readLine.emit("line", failedOffer);
            return;
        }
        // Reset retry counter from previous
        // offers and continue as normal
        file.deleteCacheFile(file.FileNames.RetryCounter);
        programMemory.nextCommand()
    });
   
   
}
