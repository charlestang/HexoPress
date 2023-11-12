const { app } = require('electron')
const path = require('path')
const fs = require('fs')
const EventEmitter = require('events')

const userDataPath = app.getPath('userData')
const configFilePath = path.join(userDataPath, 'config.json')

class Config extends EventEmitter {
  constructor () {
    super()
    this.defaultConfig = {}
    this.config = null
  }

  readConfig () {
    if (this.config !== null) {
      return
    }
    if (fs.existsSync(configFilePath)) {
      const data = fs.readFileSync(configFilePath)
      this.config = JSON.parse(data.toString())
    } else {
      this.writeConfig(this.defaultConfig)
      this.config = this.defaultConfig
    }
  }

  writeConfig (config) {
    try {
      fs.writeFileSync(configFilePath, JSON.stringify(config))
    } catch (err) {
      console.error(err)
    }
  }

  get (key) {
    this.readConfig()
    if (key in this.config) {
      return this.config[key]
    } else {
      return null
    }
  }

  set (key, value) {
    this.readConfig()
    if (this.config[key] === value) {
      return
    }
    this.config[key] = value
    this.writeConfig(this.config)
    this.emit('config:changed', key, value)
  }
}

const config = new Config()

module.exports = config
