/**
 * FreeIOT MQTT Server Daemon
 *
 * Author Noah Gao
 */
const deviceFacade = require('../model/device/device-schema')
const lib = require('./lib')
const modtool = require('../mods/tool')

class MsgServer {
  constructor (server, io) {
    this.devices = []
    this.mods = []
    this.server = server
    this.io = io
    server.on('clientConnected', this.handleConnect.bind(this))
    server.on('published', this.handleMsg.bind(this))
  }

  setup () {
    lib.setup(this.io)
    console.log('FreeIOT MQTT Server Daemon is up and running')
  }

  handleConnect (client) {
    lib.clean() // Clean Outdated Data
    const clientMeta = client.id.split('/')
    console.log(clientMeta[1] + ' Request add')
    if (!client.will || !clientMeta[1]) client.close()
    else {
      const clientWillMeta = client.will.payload.toString().split('/')
      console.log(clientWillMeta[0] + ' has secret ' + clientWillMeta[1])
      if (clientMeta[1] === clientWillMeta[0]) {
        for (let e in this.devices) {
          if (this.devices[e]._id === clientWillMeta[0]) {
            var f = true
            console.log(clientWillMeta[0] + ' is in the list')
            break
          }
        }
        if (!f) {
          deviceFacade.findById(clientWillMeta[0]).select('product owner secret status').populate('product').populate('owner').exec().then(doc => {
            if (doc === null) {
              console.log('Cannot found ' + clientWillMeta[0] + ',removed') // Device is not exist in database
              client.close()
            } else {
              if (doc.secret === clientWillMeta[1]) {
                let e = this.devices.push(doc) - 1
                // Parse Product's mod
                let modsP = []
                for (let i in this.devices[e].product.mods) {
                  if (typeof this.devices[e].product.mods[i].origin === 'string') {
                    let t = modtool(this.devices[e].product.mods[i].origin, this.devices[e].product.mods[i].vars, this.devices[e].product.mods[i].hidden.toBSON())
                    if (t.downlink) {
                      for (let i in t.downlink) {
                        if (t.downlink[i].controll.default) {
                          let driver = require('../mods/drivers/' + t.driver + '.js')
                          let message = {
                            topic: clientWillMeta[0] + '-d',
                            payload: '',
                            qos: 0,
                            retain: false
                          }
                          let temp = {}
                          temp[t.downlink[i].label] = t.downlink[i].controll.default
                          message.payload = driver.encode(temp)
                          client.server.publish(message)
                        }
                      }
                    }
                    modsP.push(t)
                  }
                }
                this.mods[e] = modsP
                lib.sendSystemMsg(clientWillMeta[0], 'online') // Send Device Online system message
                this.devices[e].datas = {}
                doc.status = 3
                doc.save()
              } else {
                console.log(clientWillMeta[0] + '\'s secret is wrong')
                client.close()
              }
            }
          }).catch(err => {
            console.error(err.message)
            client.close()
          })
        }
      } else {
        console.log(clientWillMeta[0] + ' have a wrong will')
        client.close()
      }
    }
  }

  handleMsg (packet, client) {
    switch (packet.topic) {
      case 'logout':
        const req = packet.payload.toString().split('/')
        for (let e in this.devices) {
          if (this.devices[e]._id === req[0] && this.devices[e].secret === req[1]) {
            console.log(req[0] + ' removed')
            lib.sendSystemMsg(req[0], 'offline') // Send Device Offline system message
            delete this.devices[e]
            deviceFacade.findByIdAndUpdate(req[0], {$set: { status: 2 }}, {new: true}).exec()
            break
          }
        }
        break
      case 'uplink':
        for (let e in this.devices) {
          if (this.devices[e]._id === client.id.split('/')[1]) {
            let data = []
            let types = []
            for (let i in this.mods[e]) {
              let t = lib.parser('uplink', this.mods[e][i], packet.payload.toString())
              if (lib.isEmptyObject(t)) {
                t = lib.parser('downlink', this.mods[e][i], packet.payload.toString())
                if (!lib.isEmptyObject(t)) types[data.push(t) - 1] = 2
              } else {
                types[data.push(t) - 1] = 0
              }
            }
            for (let i in data) {
              for (let j in data[i]) {
                lib.saveData(types[i], this.devices[e]._id, j, data[i][j])
                let oldData = this.devices[e].datas
                this.devices[e].datas[j] = data[i][j]
                lib.matchRule(this.devices[e]._id, this.devices[e].product._id, this.devices[e].owner._id, j, this.devices[e].datas, oldData)
              }
            }
            break
          }
        }
        break
      default:
        break
    }
  }
}

module.exports = MsgServer
