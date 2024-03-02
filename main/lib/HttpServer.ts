import fastifyStatic from '@fastify/static'
import type { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import { join } from 'path'

class HttpServer {
  public app!: FastifyInstance
  public pathSet: boolean = false
  public listening: boolean = false

  public init(path: string) {
    if (typeof this.app !== 'undefined') {
      this.app.close()
      this.pathSet = false
    }

    if (!this.pathSet) {
      this.app = Fastify()
      this.listening = false

      console.log('Static file path set to: ', join(path, 'public'))

      this.app
        .register(fastifyStatic, {
          root: join(path, 'public'),
        })
        .then(() => {
          this.pathSet = true
        })
    }

    if (!this.listening) {
      this.app.listen({ port: 2357 }, (err, address) => {
        console.log('Server is running on port 2357.')
        if (err) {
          console.error('Address is: ', address, ' and Error: ', err)
          throw err
        } else {
          this.listening = true
        }
      })
    }
  }

  public close() {
    this.app.close()
  }
}

const server = new HttpServer()
export default server
