

import { restartProgram } from "./input.js";
export class DealManager 
{
    constructor() {

    }

    findItems(items, inventory)
    {
        let foundItems = [];
        let foundItemsNames = [];

        for(let wantedItem of items)
        {
            for(let item of inventory)
            {
                if(item.market_name == wantedItem)
                {
                    if(foundItems.indexOf(item) >= 0)
                        continue; 
                    foundItems.push(item);
                    foundItemsNames.push(item.market_name);
                    break;
                }
            }
        }

        if(foundItems.length != items.length)
        {
            for(let item of items)
            {
                if(foundItemsNames.indexOf(item) < 0)
                {
                    console.log(item + " is missing from inventory.");
                }
            }

            return "err";
        }
        return foundItems;
    }

    offerCallback(err, status)
    {
        if(err)
        {
            process.emit("offerSent",err);
            return;
        }
        //console.log(status);
        process.emit("offerSent")
        
    }


    dealCase(args, programMemory)
    {
        let ownItemsQuery = [];
        let clientItemsQuery = [];
        let iterator = 3;

        for(; args[iterator] != ":" && iterator < args.length ; ++iterator)
        {
            ownItemsQuery.push(args[iterator].replaceAll("_"," "));
        }
        iterator += 1;
        for(; iterator < args.length && args[iterator] != ""; ++iterator)
        {
            clientItemsQuery.push(args[iterator].replaceAll("_"," "));
        }


        let ownFoundItems = this.findItems(ownItemsQuery, programMemory.ownInventory);
        let clientFoundItems = this.findItems(clientItemsQuery, programMemory.clientInventory);

        if(ownFoundItems == "err" || clientFoundItems == "err")
        {
            this.offerCallback("Items missing trade aborted")
            return null;
        }

        programMemory.offer.addMyItems(ownFoundItems);
        programMemory.offer.addTheirItems(clientFoundItems);


        let dealBalance = programMemory.metalManager.findDealBalance(programMemory.ownCurrencies, programMemory.clientCurrencies, args[1], args[2]);
        
        // Error messaged included in findDealBalance returns null if no deal found
        if(dealBalance == null)
        {
            return null;
        }
        let dealArrayNamesClient = ["keys", "refinedMetal", "reclaimedMetal", "scrapMetal"];
        let dealArrayNamesOwn = ["keysNegative", "refinedMetalNegative", "reclaimedMetalNegative", "scrapMetalNegative"];
        let currencyArrayNames = ["keyArray", "refinedArray", "reclaimedArray", "scrapArray"];

        for(let name = 0; name < 4; ++name)
        {
            for(let i = 0; i < dealBalance[dealArrayNamesClient[name]] ; ++i)
            {
                programMemory.offer.addTheirItem(programMemory.clientCurrencies[currencyArrayNames[name]][i]);
            }
        }

        for(let name = 0; name < 4; ++name)
        {
            for(let i = 0; i < dealBalance[dealArrayNamesOwn[name]] ; ++i)
            {
                programMemory.offer.addMyItem(programMemory.ownCurrencies[currencyArrayNames[name]][i]);
            }
        }

        programMemory.offer.send(this.offerCallback);
        programMemory.offer = programMemory.tradeManager.createOffer(programMemory.clientTradeLink);
    }
}

