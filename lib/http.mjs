import express from 'express'
import { join } from 'path'

class HttpServer {
  constructor() {
    this.app = express()
  }

  init(path) {
    this.app.use(express.static(join(path, '/public')))
    this.app.listen(2357, () => {
      console.log('Server is running on port 2357.')
    })
  }

  close() {
    this.app.close()
  }
}

const server = new HttpServer()
export default server
