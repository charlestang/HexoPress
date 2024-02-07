import fastifyStatic from '@fastify/static'
import Fastify from 'fastify'
import { join } from 'path'

class HttpServer {
  constructor() {
    this.app = Fastify()
  }

  init(path) {
    console.log('Static file path set: ', path)
    this.app.register(fastifyStatic, {
      root: join(path, 'public'),
    })

    this.app.listen({ port: 2357 }, (err, address) => {
      console.log('Server is running on port 2357.')
      if (err) {
        console.error('Address is: ', address, ' and Error: ', err)
        throw err
      }
    })
  }

  close() {
    this.app.close()
  }
}

const server = new HttpServer()
export default server
