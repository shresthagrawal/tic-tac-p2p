'use strict'
const PeerInfo = require('peer-info')

const Libp2p = require('libp2p')

const TCP = require('libp2p-tcp')
const WS = require('libp2p-websockets')
const WStar = require('libp2p-webrtc-star')
const Wrtc = require('wrtc')

const multiaddr = require('multiaddr')

const Mplex = require('libp2p-mplex')
const Secio = require('libp2p-secio')

const Bootstrap = require('libp2p-bootstrap')
const MDNS = require('libp2p-mdns')
const KadDHT = require('libp2p-kad-dht')

const Gossipsub = require("libp2p-gossipsub")

const transportKey = WStar.prototype[Symbol.toStringTag]



const info = {
    "id": process.env.ID,
    "privKey": process.env.PRIVATE_KEY,
    "pubKey": process.env.PUBLIC_KEY
}

const bootstrap = process.env.BOOTSTRAP.split(',')

let options = {
    modules: {
        transport: [ TCP, WS, WStar ],
        connEncryption: [ Secio ],
        streamMuxer: [ Mplex ],
        peerDiscovery: [ Bootstrap, MDNS ],
        dht: KadDHT,
        pubsub: Gossipsub
    },
    config: {
        transport: {
            [transportKey]: {
                Wrtc
            }
        },
        peerDiscovery: {
            bootstrap: {
                list: bootstrap
            },
            dht: {
                enabled: true,
                randomwalk: {
                    enabled: true
                }
            }
        }
    }
}

async function createLibp2pNode(isBootstrap) {
    let peerInfo = await PeerInfo.create(info);
    if(isBootstrap) options.peerInfo = peerInfo;
    // Create a libp2p instance
    let libp2p = await Libp2p.create(options)
    if(isBootstrap) {
        libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/63785')
        libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/63786/ws')
    } else {
        libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0')
        libp2p.peerInfo.multiaddrs.add('/ip4/0.0.0.0/tcp/0/ws')
    }
    
    libp2p.peerInfo.multiaddrs.forEach(ma => console.log(ma.toString()))

    // libp2p.on('peer:connect', (peerInfo) => {
    //     console.debug(`Connected to ${peerInfo.id.toB58String()}!`)
    // })
    return libp2p
}

module.exports = createLibp2pNode