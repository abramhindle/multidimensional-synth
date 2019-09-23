const OSC = require('osc-js')
const config = { udpClient: { port: 57120 } }
const osc = new OSC({ plugin: new OSC.BridgePlugin(config) })
console.log(osc);
osc.open() // start a WebSocket server on port 8080
