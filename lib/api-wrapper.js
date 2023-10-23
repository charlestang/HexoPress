'use strict'

class ApiWrapper {
  constructor () {
    this.methods = new Map()
  }

  registerApis (apis) {
    apis.forEach((apiName, callback) => {
      this.methods.set(apiName, callback)
    })
  }

  getWrapper () {
    const obj = {}
    this.methods.forEach((apiName, callback) => {
      obj[apiName] = callback
    })
    return obj
  }
}

const wrapper = new ApiWrapper()
module.exports = wrapper
