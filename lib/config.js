const { app } = require('electron')
const path = require('path')
const fs = require('fs')

const userDataPath = app.getPath('userData')
const configFilePath = path.join(userDataPath, 'config.json')

class Config {
  constructor () {
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
      console.log('data is: ', JSON.parse(data))
      this.config = JSON.parse(data)
    } else {
      console.log('defaultConfig is: ', this.defaultConfig)
      this.writeConfig(JSON.stringify(this.defaultConfig))
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
    this.config[key] = value
    this.writeConfig(this.config)
  }
}

const config = new Config()

module.exports = config
