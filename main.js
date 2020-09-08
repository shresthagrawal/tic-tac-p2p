require('dotenv').config()

const TicTacToe = require('./game')
const createLibp2pNode = require('./libp2p')

const isBootstrap = process.argv[2] == '--bootstrap' 

async function main() {
    const libp2p = await createLibp2pNode(isBootstrap)
    const ticTacToe = new TicTacToe(libp2p)
    await ticTacToe.start()
}

main()