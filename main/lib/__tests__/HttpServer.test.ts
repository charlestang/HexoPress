import { beforeEach, describe, expect, it } from 'vitest'
import httpServer from '../HttpServer'

describe('HttpServer', () => {
  beforeEach(() => {})

  it('Before init the server should be undefined.', () => {
    expect(httpServer.app).toBeUndefined()
  })
})
