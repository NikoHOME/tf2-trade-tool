


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

import { readTradeUrl, removeTradeUrl, saveTradeUrl } from "./file.js";

function exitProgram()
{
    removeTradeUrl();
    process.exit(0);
}

import { fetch, addFetchListeners } from "./fetch.js";

export function readInput(programMemory) {

    programMemory.readLine.setPrompt('Command: ');
    addFetchListeners(programMemory);
    programMemory.readLine.prompt();

    let url = readTradeUrl();

    if(url != "empty") {
        programMemory.clientTradeLink = url;
        programMemory.offer = programMemory.tradeManager.createOffer(programMemory.clientTradeLink);
        fetch(programMemory);
    }

    process.on("offerSent", () => {
        console.log("Offer Sent");
        restartProgram();
        // programMemory.readLine.prompt();
    });

    process.on("fetchEnded", () => {
        console.log("Inventory fetch ended");
        programMemory.readLine.prompt();
    });
   
    programMemory.readLine.on('line', (command) => {
        let args = command.split(" ");
        switch(args[0]) {   
            case "new":
                restartProgram();
                break;
            case "fetch":
                fetch(programMemory); //emits fetchEnded
                break;
            case "deal":
                programMemory.dealManager.dealCase(args, programMemory); //emits offerSent
                break;
            case "url":
                if(args[1]) {
                    programMemory.clientTradeLink = args[1];
                    programMemory.offer = programMemory.tradeManager.createOffer(programMemory.clientTradeLink);
                    saveTradeUrl(args[1]);
                    fetch(programMemory); //emits fetchEnded
                    break;
                }
                programMemory.readLine.prompt();
                break;
            case "exit":
                exitProgram();
                break;
            default:
                programMemory.readLine.prompt();
        }
    });
}
