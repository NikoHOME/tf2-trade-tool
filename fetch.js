
function processCurrencies(tradeVariables, item, currencies)
{
    let metalNameIndex =  tradeVariables.metalManager.currencyNames.indexOf(item.market_name);
    if(metalNameIndex > -1)
    {
        for(let element of item.tags)
        {
            if(element.category == "Quality" && element.name == "Unique")
            {
                switch(metalNameIndex)
                {
                    case 0:
                        currencies.refinedArray.push(item);
                        break;
                    case 1:
                        currencies.reclaimedArray.push(item);
                        break;
                    case 2: 
                        currencies.scrapArray.push(item);
                        break;
                    case 3:
                        currencies.keyArray.push(item);
                }
                return true;
            }
        }
    }
    return false
}





function partnerCallback(err, inventory) {
    if(err != null)
    {
        console.log(err);
        return;
    }

    process.emit("partnerInventoryLoaded", inventory);    
    //tradeVariables.tradeManager.getUserInventoryContents(tradeVariables.mySid,  tradeVariables.gameAppID,  tradeVariables.inventoryContext, true,  ownCallback)
};



function ownCallback(err, inventory) {
    if(err != null)
    {
        console.log(err);
        return;
    }
    process.emit("ownInventoryLoaded", inventory);    
    
    // console.log("Fetch Ended");
    // readInput();
};



export function fetch(tradeVariables)
{
    tradeVariables.offer.getPartnerInventoryContents(tradeVariables.gameAppID, tradeVariables.inventoryContext, partnerCallback);
    
}


export function addFetchListeners(tradeVariables)
{
    process.on("partnerInventoryLoaded", (inventory) => {

        inventory.forEach(element => {
            processCurrencies(tradeVariables, element, tradeVariables.clientCurrencies)
        });
    
        tradeVariables.clientInventory = inventory;
        tradeVariables.tradeManager.getUserInventoryContents(tradeVariables.mySid,  tradeVariables.gameAppID,  tradeVariables.inventoryContext, true,  ownCallback)
    });

    process.on("ownInventoryLoaded", (inventory) => {
        inventory.forEach(element => {
            processCurrencies(tradeVariables, element, tradeVariables.ownCurrencies)
        });
    
        tradeVariables.ownInventory = inventory;
        console.log("Fetch Ended");
        tradeVariables.readLine.prompt();
    });
}

