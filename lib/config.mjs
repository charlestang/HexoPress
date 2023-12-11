import { app } from 'electron'
import EventEmitter from 'events'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const userDataPath = app.getPath('userData')
const configFilePath = join(userDataPath, 'config.json')

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
    if (existsSync(configFilePath)) {
      const data = readFileSync(configFilePath)
      this.config = JSON.parse(data.toString())
    } else {
      this.writeConfig(this.defaultConfig)
      this.config = this.defaultConfig
    }
  }

  writeConfig (config) {
    try {
      writeFileSync(configFilePath, JSON.stringify(config))
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

export default config
