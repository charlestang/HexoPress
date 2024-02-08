import fastifyStatic from '@fastify/static'
import Fastify from 'fastify'
import { join } from 'path'

class HttpServer {
  constructor() {
    this.app = Fastify()
    this.pathSet = false
    this.listening = false
  }

  init(path) {
    if (!this.pathSet) {
      console.log('Static file path set to: ', join(path, 'public'))
      this.app
        .register(fastifyStatic, {
          root: join(path, 'public'),
        })
        .then(fastifyInstance => {
          this.pathSet = true
        })
    }

    if (!this.listening) {
      this.app.listen({ port: 2357 }, (err, address) => {
        console.log('Server is running on port 2357.')
        if (err) {
          console.error('Address is: ', address, ' and Error: ', err)
          throw err
        }
        this.listening = true
      })
    }
  }

  close() {
    this.app.close()
  }
}

const server = new HttpServer()
export default server
