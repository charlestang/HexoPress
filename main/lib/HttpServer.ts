import fastifyStatic from '@fastify/static'
import type { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import { join } from 'path'

class HttpServer {
  app?: FastifyInstance
  pathSet: boolean
  listening: boolean

  constructor() {
    this.app = undefined
    this.pathSet = false
    this.listening = false
  }

  init(path: string) {
    if (this.app !== null) {
      this.app?.close()
      this.app = undefined
      this.pathSet = false
      this.listening = false
    }
    if (!this.pathSet) {
      this.app = Fastify()
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
      this.app?.listen({ port: 2357 }, (err, address) => {
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
    this.app?.close()
  }
}

const server = new HttpServer()
export default server
