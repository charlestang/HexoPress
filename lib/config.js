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
    console.log('readConfig is called.')
    console.log('config is: ')
    console.log(this.config)
    if (this.config !== null) {
      return
    }
    console.log('configFilePath is: ', configFilePath)
    if (fs.existsSync(configFilePath)) {
      const data = fs.readFileSync(configFilePath)
      console.log('data is: ', data.toString())
      this.config = JSON.parse(data.toString())
      console.log('parse result is: ', typeof this.config, this.config)
    } else {
      console.log('defaultConfig is: ', this.defaultConfig)
      this.writeConfig(this.defaultConfig)
      this.config = this.defaultConfig
      console.log('after writeConfig config is: ', this.config)
    }
    console.log('before exit readConfig config is: ')
    console.log(this.config)
  }

  writeConfig (config) {
    console.log('writeConfig is called.')
    console.log('parameter config is: ')
    console.log(config)
    try {
      fs.writeFileSync(configFilePath, JSON.stringify(config))
    } catch (err) {
      console.error(err)
    }
  }

  get (key) {
    this.readConfig()
    console.log('key is: ', key, 'typeof key is: ', typeof key, ' and config is: ', this.config, ' typeof config is: ', typeof this.config)
    if (key in this.config) {
      return this.config[key]
    } else {
      return null
    }
  }

  set (key, value) {
    console.log('set is called.')
    console.log('key, and value are: ')
    console.log(key, value)
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
