


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
            console.log(err);
        //console.log(status);
        process.emit("offerSent")
        
    }


    addDealListeners(tradeVariables)
    {
        process.on("offerSent", () => {
            console.log("Offer Sent");
            tradeVariables.readLine.prompt();
        });
    } 


    dealCase(args, tradeVariables)
    {
        let ownItemsQuery = [];
        let clientItemsQuery = [];
        let iterator = 3;
        for(; args[iterator] != ":"; ++iterator)
        {
            ownItemsQuery.push(args[iterator].replaceAll("_"," "));
        }
        iterator += 1;
        for(; iterator < args.length && args[iterator] != ""; ++iterator)
        {
            clientItemsQuery.push(args[iterator].replaceAll("_"," "));
        }

        //console.log(ownItemsQuery);
        //console.log(clientItemsQuery);

        let ownFoundItems = this.findItems(ownItemsQuery, tradeVariables.ownInventory);
        let clientFoundItems = this.findItems(clientItemsQuery, tradeVariables.clientInventory);

        if(ownFoundItems == "err" || clientFoundItems == "err")
        {
            console.log("Items missing trade aborted");
            return null;
        }

        //console.log(ownFoundItems);
        //console.log(clientFoundItems);

        tradeVariables.offer.addMyItems(ownFoundItems);
        tradeVariables.offer.addTheirItems(clientFoundItems);


        let dealBalance = tradeVariables.metalManager.findDealBalance(tradeVariables.ownCurrencies, tradeVariables.clientCurrencies, args[1], args[2]);
        //console.log(dealBalance);
        
        let dealArrayNamesClient = ["keys", "refinedMetal", "reclaimeMetal", "scrapMetal"];
        let dealArrayNamesOwn = ["keysNegative", "refinedMetalNegative", "reclaimedMetalNegative", "scrapMetalNegative"];
        let currencyArrayNames = ["keyArray", "refinedArray", "reclaimedArray", "scrapArray"];

        for(let name = 0; name < 4; ++name)
        {
            for(let i = 0; i < dealBalance[dealArrayNamesClient[name]] ; ++i)
            {
                tradeVariables.offer.addTheirItem(tradeVariables.clientCurrencies[currencyArrayNames[name]][i]);
            }
        }

        for(let name = 0; name < 4; ++name)
        {
            //console.log(dealArrayNamesOwn[name]);
            for(let i = 0; i < dealBalance[dealArrayNamesOwn[name]] ; ++i)
            {
                tradeVariables.offer.addMyItem(tradeVariables.ownCurrencies[currencyArrayNames[name]][i]);
                //console.log(tradeVariables.ownCurrencies[currencyArrayNames[name]][i].market_name);
            }
        }

        tradeVariables.offer.send(this.offerCallback);
        tradeVariables.offer = tradeVariables.tradeManager.createOffer(tradeVariables.clientTradeLink);
    }
}


// module.exports = DealManager;