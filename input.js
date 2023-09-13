import { fetch, addFetchListeners } from "./fetch.js";

export function readInput(tradeVariables)
{
    tradeVariables.readLine.setPrompt('Command: ');
    addFetchListeners(tradeVariables);
    tradeVariables.dealManager.addDealListeners(tradeVariables);
    tradeVariables.readLine.prompt();
   
    tradeVariables.readLine.on('line', (command) => {
        let args = command.split(" ");
        switch(args[0])
        {   
            case "fetch":
                //tradeVariables.offer.getPartnerInventoryContents(TradeVariables.gameAppID, TradeVariablesinventoryContext, partnerCallback);
                fetch(tradeVariables);
                break;
            case "deal":
                tradeVariables.dealManager.dealCase(args, tradeVariables);
                break;
            case "url":
                if(args[1])
                {
                    tradeVariables.clientTradeLink = args[1];
                    tradeVariables.offer = tradeVariables.tradeManager.createOffer(tradeVariables.clientTradeLink);
                    fetch(tradeVariables);
                }
                break;
            case "exit":
                tradeVariables.readLine.close();
                break;
            default:
                tradeVariables.readLine.prompt();
        }
    });
}


// rl.setPrompt(`What is your age? `);
// rl.prompt();
// rl.on('line', (age) => {
//     console.log(`Age received by the user: ${age}`);
//     rl.close();
// });
