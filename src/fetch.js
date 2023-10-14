import SteamUser from "steam-user";

function processCurrencies(programMemory, item, currencies)
{
    let metalNameIndex =  programMemory.metalManager.currencyNames.indexOf(item.market_name);
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
        console.log("<!!> Failed to load client items retrying")
        process.emit("retryFetch");
        return;
    }

    process.emit("partnerInventoryLoaded", inventory);    
};



function ownCallback(err, inventory) {
    if(err != null)
    {
        console.log(err);
        console.log("<!!> Failed to load own items retrying")
        process.emit("retryFetch");
        return;
    }
    process.emit("ownInventoryLoaded", inventory);    
};


function userDetailsCallback(err, personas) {
    if(err != null) {
        console.log(err);
        console.log("<!!> Failed to load user details retrying")
        process.emit("retryUserDetail");
        return;
    }

    if(personas != null) {
        let name = Object.values(personas)[0].player_name;
        console.log("<++> Created an offer with " + "\'" + name  + "\'");
    }

    process.emit("userDetails");
}


export function fetch(programMemory)
{
    programMemory.offer.getPartnerInventoryContents(programMemory.gameAppID, programMemory.inventoryContext, partnerCallback);
}



export function addFetchListeners(programMemory)
{
    process.on("partnerInventoryLoaded", (inventory) => {

        inventory.forEach(element => {
            processCurrencies(programMemory, element, programMemory.clientCurrencies)
        });
    
        programMemory.clientInventory = inventory;
        programMemory.tradeManager.getUserInventoryContents(programMemory.mySid,  programMemory.gameAppID,  programMemory.inventoryContext, true,  ownCallback)
    });

    process.on("ownInventoryLoaded", (inventory) => {
        inventory.forEach(element => {
            processCurrencies(programMemory, element, programMemory.ownCurrencies)
        });
    
        programMemory.ownInventory = inventory;
        programMemory.user.getPersonas([programMemory.offer.partner], userDetailsCallback);

        //process.emit("userDetails");
    });

    process.on("retryFetch", () => {
        fetch(programMemory);
    });

    process.on("retryUserDetail", () => {
        programMemory.user.getPersonas([programMemory.offer.partner], userDetailsCallback);
    });


    process.on("userDetails", () => {

        process.emit("fetchEnded");
    });
}

