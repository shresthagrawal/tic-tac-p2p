
### Tic-Tac-Toe on Libp2p  
This is first tic tac toe game which is completely decentralised! The game is built on libp2p. It uses noise protocol for encryption, kademlia for pear discovery, gossipsub as a pubsub mechanism. Above all the technical jargon it is fun to play.  There isn't many simple examples  of using libp2p and I believe this game could be one of them. 

How to play the game?
1. `cp .env.example .env` (modify bootstrap list if required)
2. `npm i`
3. `npm start`

If you are the first player to start the game on the network use `npm run start:bootstrap` 
