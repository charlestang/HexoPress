'use strict'

const Store = require('electron-store')

const settings = new Store()

settings.set('base_dir', '')

const apis = new Map()
apis.set('getSettings', (settingName) => settings.get(settingName))
apis.set('setSettings', (settingName, settingValue) => settings.set(settingName, settingValue))
settings.apis = apis

module.exports = settings
