# steam-trade-tool W.I.P

A simple terminal tool for trading tf2 items.  
Precisely calculated the metal values to balance a trade deal.  
Creates a trade offer with a minimal ammount of items needed.  


Currently avaible actions :
- help (print help)
- url (creates a trade offer from a trade url)
- fetch (manually update inventory data)
- deal [keys] [metal] [my_items] : [client_items] (send a trade offer with specified items, keys and metal)
- again (repeat the last command)
- exit (exits program)
- new (restart program)

## deal formating

- [keys] - ammount of keys the client will give, can be negative
- [metal] - ammount of metal the client will give, can be negative, **represented with refined metal fractions e.g. 12.33 = 12 refined + 1 reclaimed**
- [my_items] - list of your items with market names seperated by a space, **multiple words in an item name are seperated by an undersoce e.g. The_Jag**
- [:] - own item and client item seperator
- [client_items] - the same as above  
