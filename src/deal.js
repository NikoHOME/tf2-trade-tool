//a class responsible for parsing the deal command, adding items to the offer and sending the offer

export class DealManager  {
    constructor() {
        this.dealArrayNamesClient = ["keys", "refinedMetal", "reclaimedMetal", "scrapMetal"];
        this.dealArrayNamesOwn = ["keysNegative", "refinedMetalNegative", "reclaimedMetalNegative", "scrapMetalNegative"];
        this.currencyArrayNames = ["keyArray", "refinedArray", "reclaimedArray", "scrapArray"];
    }

    //Searches the inventory for wanted items and returns them as a list
    findItems(items, inventory) {
        let foundItems = [];
        let foundItemsNames = [];

        
        for(let wantedItem of items) {
            for(let item of inventory) {
                if(item.market_name == wantedItem) {
                    //If the item is already in the list continue
                    if(foundItems.indexOf(item) >= 0)
                        continue; 
                    foundItems.push(item);
                    foundItemsNames.push(item.market_name);
                    break;
                }
            }
        }
        //Print the missing items
        if(foundItems.length != items.length) {
            for(let item of items) {
                if(foundItemsNames.indexOf(item) < 0) {
                    console.log(item + " is missing from inventory.");
                }
            }

            return "err";
        }
        return foundItems;
    }

    offerSendingCallback(err, status) {
        if(err) {
            process.emit("offerSent",err);
            return;
        }
        process.emit("offerSent")
        
    }

    dealCase(args, programMemory) {
        let ownItemsQuery = [];
        let clientItemsQuery = [];
        let iterator = 3;
        //Parse own items
        for(; args[iterator] != ":" && iterator < args.length ; ++iterator) {
            ownItemsQuery.push(args[iterator].replace(/\s/g, "").replaceAll("_"," "));
        }
        iterator += 1;
        //Parse client items
        for(; iterator < args.length && args[iterator] != ""; ++iterator) {
            clientItemsQuery.push(args[iterator].replace(/\s/g, "").replaceAll("_"," "));
        }

        //Find parsed items in the inventory
        let ownFoundItems = this.findItems(ownItemsQuery, programMemory.ownInventory);
        let clientFoundItems = this.findItems(clientItemsQuery, programMemory.clientInventory);

        if(ownFoundItems == "err" || clientFoundItems == "err") {
            this.offerCallback("<!!> Items missing trade aborted")
            programMemory.nextCommand();
            return null;
        }

        programMemory.offer.addMyItems(ownFoundItems);
        programMemory.offer.addTheirItems(clientFoundItems);

        //args[1] - key ammount
        //args[2] - metal ammount
        let dealBalance = programMemory.metalManager.findDealBalance(
            programMemory.ownCurrencies,
            programMemory.clientCurrencies,
            args[1], 
            args[2]
        );
        
        // Error messaged included in findDealBalance method above returns null if no deal found
        if(dealBalance == null)
        {
            programMemory.nextCommand();
            return null;
        }
        
        //Add balanced currencies to both sides of the offer

        for(let currencyNameIndex = 0; currencyNameIndex < 4; ++currencyNameIndex) {

            let realCurrencyName = this.currencyArrayNames[currencyNameIndex];

            let calculatedCurrencyName = this.dealArrayNamesClient[currencyNameIndex];
            let ammountOfCurrency = dealBalance[calculatedCurrencyName];
            
            for(let index = 0; index < ammountOfCurrency ; ++index) {

                let currencyItem = programMemory.clientCurrencies[realCurrencyName][index];
                programMemory.offer.addTheirItem(currencyItem);

            }

            calculatedCurrencyName = this.dealArrayNamesOwn[currencyNameIndex];
            ammountOfCurrency = dealBalance[calculatedCurrencyName];

            for(let index = 0; index < ammountOfCurrency ; ++index) {

                let currencyItem = programMemory.ownCurrencies[realCurrencyName][index];
                programMemory.offer.addMyItem(currencyItem);

            }
        }
        //Send the offer and create a new one
        programMemory.offer.send(this.offerSendingCallback);
        programMemory.offer = programMemory.tradeManager.createOffer(programMemory.clientTradeLink);
    }
}

