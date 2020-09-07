var inquirer = require('inquirer');

class Game {
    constructor(libp2p) {
        this.libp2p = libp2p
    }
    
    async start() {
        if (!this.libp2p.isStarted())
            await this.libp2p.start()
        
        const {name, type} = await inquirer.prompt([
           {
                type: 'list',
                name: 'type',
                message: 'What do you want to do?',
                choices: [
                'Start a game',
                'Join a game',
                ]},
            {
                type: 'input',
                name: 'name',
                message: 'Name the game you want to create/ join?'}
        ])
        this.name = name
        this.isGameOwner = type == 'Start a game'
        
        this.join(name)
        
        this.gameState = new Array(9).fill(' ')
        this.moveToggle = this.isGameOwner
        
        await this.play() 
    }

    getChoices() {
        return this.gameState.map((e, i) => e === ' ' ? i : '').filter(String)
    }

    async play() {
        if (this.moveToggle) {
            const { move } = await inquirer.prompt([{
                type: 'list',
                name: 'move',
                message: 'Your move?',
                choices: this.getChoices()
            }])
            this.libp2p.pubsub.publish(this.name, move.toString()).catch((err) => {
                if (err) throw err
            })
        } else 
            console.log('Waiting for the oponent to make a move!')
    }

    check(player) {
        for (let i = 0; i < 3; i++) {
            let hasWon = true
            for (let j = 0; j < 3; j++) {
                if (this.gameState[(i * 3) + j] != player) hasWon = false
            }
            if (hasWon) return 1
        }

        for (let i = 0; i < 3; i++) {
            let hasWon = true
            for (let j = 0; j < 3; j++) 
                if (this.gameState[i + (j * 3)] != player) hasWon = false
            if (hasWon) return 1
        }

        let hasWon = true
        for (let i = 0; i <= 8; i += 4) 
            if (this.gameState[i] != player) hasWon = false
        if (hasWon) return 1

        hasWon = true
        for (let i = 2; i <= 6; i += 2) 
            if (this.gameState[i] != player) hasWon = false
        if (hasWon) return 1

        if ((this.getChoices()).length == 0) return -1

        return 0
    }


    async modifyState(player, move) {     
        this.gameState[move] = player
        this.moveToggle = !this.moveToggle
        this.show()
        const state = this.check(player)
        if (state == 1) {
            console.log(`Player ${player} won the game!`)
            await this.restart()
        }
        else if (state == -1) {
            console.log(`This game was a draw!`)
            await this.restart()
        }
        else this.play()
    }

    show() {
        console.log(`${this.gameState[0]} _|_ ${this.gameState[1]} _|_ ${this.gameState[2]}`)
        console.log(`${this.gameState[3]} _|_ ${this.gameState[4]} _|_ ${this.gameState[5]}`)
        console.log(`${this.gameState[6]}  |  ${this.gameState[7]}  |  ${this.gameState[8]}`)
    }

    async restart() {
        this.libp2p.pubsub.unsubscribe(this.name)
        await this.start()
    }

    join() {
        this.libp2p.pubsub.subscribe(this.name, (message) => {
            const fromMe = this.libp2p.peerInfo.id.toB58String() == message.from
            const player = (fromMe && this.isGameOwner) || (!fromMe && !this.isGameOwner) ? 'x' : 'o'
            this.modifyState(player, message.data) 
        })
    }
}

module.exports = Game

