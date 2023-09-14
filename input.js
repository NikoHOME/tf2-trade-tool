import { fetch, addFetchListeners } from "./fetch.js";

function relog(tradeVariables)
{
    tradeVariables.tradeManager.shutdown();
    tradeVariables.user.relog();
}

import TradeOfferManager from 'steam-tradeoffer-manager';

function resetTradeManager(tradeVariables)
{
    tradeVariables.tradeManager = new TradeOfferManager({
        "steam": tradeVariables.user,
        "community": tradeVariables.community,
        "language": "en"
    });

    fetch(tradeVariables);
}

// function resetCookies(tradeVariables)
// {
//     tradeVariables.user.webLogOn();
// }


export function readInput(tradeVariables)
{
    tradeVariables.readLine.setPrompt('Command: ');
    addFetchListeners(tradeVariables);
    tradeVariables.dealManager.addDealListeners(tradeVariables);
    tradeVariables.readLine.prompt();

    tradeVariables.user.on("loggedOn", function() {
        tradeVariables.user.webLogOn();
        resetTradeManager(tradeVariables);
    });

    tradeVariables.user.on("webSession", function(sessionID, cookies) {
        tradeVariables.community.setCookies(cookies);
    });
   
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
                relog(tradeVariables);
                break;
            case "url":
                // resetCookies(tradeVariables);
                if(args[1])
                {
                    tradeVariables.clientTradeLink = args[1];
                    // if(tradeVariables.offer)
                    // {
                    //     console.log(tradeVariables.offer);
                    //     tradeVariables.offer.cancel(function () {
                    //         console.log("Trade Canceled");
                    //     });
                    // }
                    tradeVariables.offer = tradeVariables.tradeManager.createOffer(tradeVariables.clientTradeLink);
                    fetch(tradeVariables);
                }
                else
                {
                    tradeVariables.readLine.prompt();
                }

                break;
            case "exit":
                tradeVariables.readLine.close();
                tradeVariables.readLine.removeAllListeners("line");
                break;
            default:
                tradeVariables.readLine.prompt();
        }
    });
}
