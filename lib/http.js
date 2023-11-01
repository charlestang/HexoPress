const express = require('express')
const path = require('path')
const config = require(path.join(__dirname, '/config.js'))

const app = express()

app.use(express.static(path.join(config.get('vaultPath'), '/public')))

app.listen(2357, () => {
  console.log('Server is running on port 2357.')
})

module.exports = app
