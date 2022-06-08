import { assertEx, delay } from '@xylabs/sdk-js'
import { XyoBoundWitness, XyoBoundWitnessBuilder, XyoPayloadBuilder } from '@xyo-network/core'
import { v4 } from 'uuid'

import { XyoApiConfig } from '../../models'
import { XyoArchivistApi } from '../Api'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

const schema = 'network.xyo.debug'

const getQuery = (): XyoBoundWitness => {
  const payload = new XyoPayloadBuilder({ schema }).fields({ nonce: v4() }).build()
  return new XyoBoundWitnessBuilder({ inlinePayloads: true }).payload(payload).build()
}

const issueQuery = async (query: XyoBoundWitness = getQuery()): Promise<string> => {
  const api = new XyoArchivistApi(config)
  const response = await api.node('temp').post(query)
  const id = response?.[0]?.[0]
  expect(id).toBeDefined()
  return assertEx(id)
}

describe('XyoArchivistNodeApi', () => {
  describe('node', () => {
    describe('without archive supplied', () => {
      it('calculates the correct path', () => {
        const api = new XyoArchivistApi(config)
        const path = api.node().config.root
        expect(path).toBe('/temp/')
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
    let id: string
    beforeEach(async () => {
      id = await issueQuery()
    })
    describe('without valid query id', () => {
      it('returns the query result', async () => {
        const api = new XyoArchivistApi(config)
        await delay(1000)
        const [err, res, resFull] = await api.node().result(id).get('tuple')
        expect(err).toBeUndefined()
        expect(res).toBeDefined()
        // TODO: Validate response properties
        expect(resFull).toBeDefined()
        expect(resFull.status).toBe(200)
      })
    })
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
  describe('perform', () => {
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
