import { XyoApiConfig } from '../../models'
import { XyoArchivistApi } from '../Api'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

describe('XyoArchivistSchemaApi', () => {
  describe('node', () => {
    describe('without archive supplied', () => {
      it('calculates the correct path', () => {
        const api = new XyoArchivistApi(config)
        const path = api.node().config.root
        expect(path).toBe('/')
      })
    })
    describe('with archive supplied', () => {
      const archive = 'foo'
      it('calculates the correct path', () => {
        const api = new XyoArchivistApi(config)
        const path = api.node(archive).config.root
        expect(path).toBe(`/${archive}/`)
      })
    })
  })
  describe('queryResult', () => {
    const id = '123456789'
    describe('without archive supplied', () => {
      it('calculates the correct path', () => {
        const api = new XyoArchivistApi(config)
        const path = api.node().result(id).config.root
        expect(path).toBe(`/query/${id}/`)
      })
    })
    describe('with archive supplied', () => {
      const archive = 'foo'
      it('calculates the correct path', () => {
        const api = new XyoArchivistApi(config)
        const path = api.node(archive).result(id).config.root
        expect(path).toBe(`/query/${id}/`)
      })
    })
  })
})
