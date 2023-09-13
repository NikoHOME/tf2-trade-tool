

export class Currencies {
    constructor() {
        this.keyArray = [];
        this.refinedArray = [];
        this.reclaimedArray = [];
        this.scrapArray = [];
    }
};

export class SimpleCurrencies {
    constructor() {
        this.keys = 0;
        this.refinedMetal = 0;
        this.reclaimedMetal = 0;
        this.scrapMetal = 0;
        this.steps = 0;

        this.keysNegative = 0;
        this.refinedMetalNegative = 0;
        this.reclaimedMetalNegative = 0;
        this.scrapMetalNegative = 0;
    }

    copyInto(copy) {
        copy.keys = this.keys;
        copy.refinedMetal = this.refinedMetal;
        copy.reclaimedMetal = this.reclaimedMetal;
        copy.scrapMetal = this.scrapMetal;
        copy.steps = this.steps;

        copy.keysNegative = this.keysNegative;
        copy.refinedMetalNegative = this.refinedMetalNegative;
        copy.reclaimedMetalNegative = this.reclaimedMetalNegative;
        copy.scrapMetalNegative = this.scrapMetalNegative;
    }

    swapMetalValues() {
        
        let refinedMetalCopy = this.refinedMetal
        this.refinedMetal = this.refinedMetalNegative;
        this.refinedMetalNegative = refinedMetalCopy;

        let reclaimedMetalCopy = this.reclaimedMetal
        this.reclaimedMetal = this.reclaimedMetalNegative;
        this.reclaimedMetalNegative = reclaimedMetalCopy;

        let scrapMetalCopy = this.scrapMetal;
        this.scrapMetal = this.scrapMetalNegative;
        this.scrapMetalNegative = scrapMetalCopy;

    }

}


export class MetalManager
{
    constructor() {
        this.balanceCalculationArraySize = 10000;
        this.refinedMetalValue = 9;
        this.reclaimedMetalValue = 3;
        this.scrapMetalValue = 1;
        this.currencyNames = ["Refined Metal", "Reclaimed Metal", "Scrap Metal", "Mann Co. Supply Crate Key"];
    }

    simplifyCurrencies(complex) {
        let simple = new SimpleCurrencies();
        simple.keys = complex.keyArray.length;
        simple.refinedMetal = complex.refinedArray.length;
        simple.reclaimedMetal = complex.reclaimedArray.length;
        simple.scrapMetal = complex.scrapArray.length;
        return simple;
    }

    iterateOverArrayForward(calculationArray, currencies, metalName, metalValue)
    {
        for(let i = 0; i < currencies[metalName] ; ++i)
        {
            for(let j = this.balanceCalculationArraySize - metalValue; j >= 0; --j)
            {
                if(typeof calculationArray[j] == "undefined")
                    continue;
                
                if(typeof calculationArray[j + metalValue] == "undefined")
                {
                    calculationArray[j + metalValue] = new SimpleCurrencies();
                    calculationArray[j].copyInto(calculationArray[j + metalValue]);
                    calculationArray[j + metalValue].steps += 1;
                    calculationArray[j + metalValue][metalName] += 1;
                }
                else
                {
                    
                    if(calculationArray[j].steps < calculationArray[j + metalValue].steps - 1)
                    {
                        calculationArray[j].copyInto(calculationArray[j + metalValue]);
                        calculationArray[j + metalValue].steps += 1;
                        calculationArray[j + metalValue][metalName ] += 1;
                    }
                }

            }
        }
    }

    iterateOverArrayBackward(calculationArray, currencies, metalName, metalValue)
    {
        for(let i = 0; i < currencies[metalName] ; ++i)
        {
            for(let j = metalValue; j <= this.balanceCalculationArraySize; ++j)
            {
                if(typeof calculationArray[j] == "undefined")
                    continue;
                
                if(typeof calculationArray[j - metalValue] == "undefined")
                {
                    calculationArray[j - metalValue] = new SimpleCurrencies();
                    calculationArray[j].copyInto(calculationArray[j - metalValue]);
                    calculationArray[j - metalValue].steps += 1;
                    calculationArray[j - metalValue][metalName + "Negative"] += 1;
                }
                else
                {
                    if(calculationArray[j].steps < calculationArray[j - metalValue].steps - 1)
                    {
                        calculationArray[j].copyInto(calculationArray[j - metalValue]);
                        calculationArray[j - metalValue].steps += 1;
                        calculationArray[j - metalValue][metalName + "Negative"] += 1;
                    }
                }

            }
        }
    }

    convertToScrapMetal(balance)
    {
        let absoluteBalance = Math.abs(balance);
        let balanceFloor = Math.floor(absoluteBalance);
        let balanceDecimal = absoluteBalance - balanceFloor;
        let balanceDecimalScrap = Math.floor(balanceDecimal.toFixed(2) / 0.11);
        let finalBalance = parseInt(balanceFloor * this.refinedMetalValue) + parseInt(balanceDecimalScrap);

        return finalBalance;
    }

    findDealBalance(ownCurrencies, clientCurrencies, keys, balance)
    {
        let simpleCurrenciesOwn = this.simplifyCurrencies(ownCurrencies);
        let simpleCurrenciesClient = this.simplifyCurrencies(clientCurrencies);

        if(keys < 0 && simpleCurrenciesOwn.keys < Math.abs(keys))
        {
            console.log("Not enough keys [Own]");
            return null;
        }
        else if (simpleCurrenciesClient.keys < keys)
        {
            console.log("Not enough keys [Client]");
            return null;
        }

        let finalBalance = this.convertToScrapMetal(balance);

        let balanceCalculationArray = Array(this.balanceCalculationArraySize);

        balanceCalculationArray[0] = new SimpleCurrencies();

        if(balance < 0)
        {
            let tempCopy = simpleCurrenciesOwn
            simpleCurrenciesOwn = simpleCurrenciesClient;
            simpleCurrenciesClient = tempCopy;
        }
        
        this.iterateOverArrayForward(balanceCalculationArray, simpleCurrenciesClient, "refinedMetal", this.refinedMetalValue);
        this.iterateOverArrayForward(balanceCalculationArray, simpleCurrenciesClient, "reclaimedMetal", this.reclaimedMetalValue);
        this.iterateOverArrayForward(balanceCalculationArray, simpleCurrenciesClient, "scrapMetal", this.scrapMetalValue);

        this.iterateOverArrayBackward(balanceCalculationArray, simpleCurrenciesOwn, "refinedMetal", this.refinedMetalValue);
        this.iterateOverArrayBackward(balanceCalculationArray, simpleCurrenciesOwn, "reclaimedMetal", this.reclaimedMetalValue);
        this.iterateOverArrayBackward(balanceCalculationArray, simpleCurrenciesOwn, "scrapMetal", this.crapMetalValue);

        if(typeof balanceCalculationArray[finalBalance] != "undefined")
        {
            if(keys < 0)
                balanceCalculationArray[finalBalance].keysNegative = Math.abs(keys);
            else
                balanceCalculationArray[finalBalance].keys = Math.abs(keys);

            if(balance < 0)
                balanceCalculationArray[finalBalance].swapMetalValues();

            return balanceCalculationArray[finalBalance];
        }
        else
        {
            console.log("Not enough currency")
            return null
        }
    }
}


// module.exports = MetalManager;

// const balanceCalculationArraySize = 10000;

// const refinedMetalValue = 9;
// const reclaimedMetalValue = 3;
// const scrapMetalValue = 1;



// function iterateOverArrayForward(calculationArray, currencies, metalName, metalValue)
// {
//     for(let i = 0; i < currencies[metalName] ; ++i)
//     {
//         for(let j = balanceCalculationArraySize - metalValue; j >= 0; --j)
//         {
//             if(typeof calculationArray[j] == "undefined")
//                 continue;
            
//             if(typeof calculationArray[j + metalValue] == "undefined")
//             {
//                 calculationArray[j + metalValue] = new SimpleCurrencies();
//                 calculationArray[j].copyInto(calculationArray[j + metalValue]);
//                 calculationArray[j + metalValue].steps += 1;
//                 calculationArray[j + metalValue][metalName] += 1;
//             }
//             else
//             {
                
//                 if(calculationArray[j].steps < calculationArray[j + metalValue].steps - 1)
//                 {
//                     calculationArray[j].copyInto(calculationArray[j + metalValue]);
//                     calculationArray[j + metalValue].steps += 1;
//                     calculationArray[j + metalValue][metalName ] += 1;
//                 }
//             }

//         }
//     }
// }

// function iterateOverArrayBackward(calculationArray, currencies, metalName, metalValue)
// {
//     for(let i = 0; i < currencies[metalName] ; ++i)
//     {
//         for(let j = metalValue; j <= balanceCalculationArraySize; ++j)
//         {
//             if(typeof calculationArray[j] == "undefined")
//                 continue;
            
//             if(typeof calculationArray[j - metalValue] == "undefined")
//             {
//                 calculationArray[j - metalValue] = new SimpleCurrencies();
//                 calculationArray[j].copyInto(calculationArray[j - metalValue]);
//                 calculationArray[j - metalValue].steps += 1;
//                 calculationArray[j - metalValue][metalName + "Negative"] += 1;
//             }
//             else
//             {
//                 if(calculationArray[j].steps < calculationArray[j - metalValue].steps - 1)
//                 {
//                     calculationArray[j].copyInto(calculationArray[j - metalValue]);
//                     calculationArray[j - metalValue].steps += 1;
//                     calculationArray[j - metalValue][metalName + "Negative"] += 1;
//                 }
//             }

//         }
//     }
// }

// function convertToScrapMetal(balance)
// {
//     let absoluteBalance = Math.abs(balance);
//     let balanceFloor = Math.floor(absoluteBalance);
//     let balanceDecimal = absoluteBalance - balanceFloor;
//     let balanceDecimalScrap = Math.floor(balanceDecimal.toFixed(2) / 0.11);
//     let finalBalance = parseInt(balanceFloor * refinedMetalValue) + parseInt(balanceDecimalScrap);

//     return finalBalance;
// }

// function findDealBalance(ownCurrencies, clientCurrencies, keys, balance)
// {
//     let simpleCurrenciesOwn = simplifyCurrencies(ownCurrencies);
//     let simpleCurrenciesClient = simplifyCurrencies(clientCurrencies);

//     if(keys < 0 && simpleCurrenciesOwn.keys < Math.abs(keys))
//     {
//         console.log("Not enough keys [Own]");
//         return null;
//     }
//     else if (simpleCurrenciesClient.keys < keys)
//     {
//         console.log("Not enough keys [Client]");
//         return null;
//     }

//     let finalBalance = convertToScrapMetal(balance);

//     let balanceCalculationArray = Array(balanceCalculationArraySize);

//     balanceCalculationArray[0] = new SimpleCurrencies();

//     if(balance < 0)
//     {
//         let tempCopy = simpleCurrenciesOwn
//         simpleCurrenciesOwn = simpleCurrenciesClient;
//         simpleCurrenciesClient = tempCopy;
//     }
    
//     iterateOverArrayForward(balanceCalculationArray, simpleCurrenciesClient, "refinedMetal", refinedMetalValue);
//     iterateOverArrayForward(balanceCalculationArray, simpleCurrenciesClient, "reclaimedMetal", reclaimedMetalValue);
//     iterateOverArrayForward(balanceCalculationArray, simpleCurrenciesClient, "scrapMetal", scrapMetalValue);

//     iterateOverArrayBackward(balanceCalculationArray, simpleCurrenciesOwn, "refinedMetal", refinedMetalValue);
//     iterateOverArrayBackward(balanceCalculationArray, simpleCurrenciesOwn, "reclaimedMetal", reclaimedMetalValue);
//     iterateOverArrayBackward(balanceCalculationArray, simpleCurrenciesOwn, "scrapMetal", scrapMetalValue);

//     if(typeof balanceCalculationArray[finalBalance] != "undefined")
//     {
//         if(keys < 0)
//             balanceCalculationArray[finalBalance].keysNegative = Math.abs(keys);
//         else
//             balanceCalculationArray[finalBalance].keys = Math.abs(keys);

//         if(balance < 0)
//             balanceCalculationArray[finalBalance].swapMetalValues();

//         return balanceCalculationArray[finalBalance];
//     }
//     else
//     {
//         console.log("Not enough currency")
//         return null
//     }
// }


