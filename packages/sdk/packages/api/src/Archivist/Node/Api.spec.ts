import { assertEx, delay } from '@xylabs/sdk-js'
import { XyoBoundWitness, XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { uuid } from '@xyo-network/core'
import { XyoPayload, XyoPayloadBuilder } from '@xyo-network/payload'

import { XyoApiConfig, XyoApiEnvelope } from '../../models'
import { XyoArchivistApi } from '../Api'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

const schema = 'network.xyo.debug'

const getQuery = (count = 1): XyoBoundWitness => {
  const payloads = [] as XyoPayload[]
  for (let i = 0; i < count; i++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payloads.push(new XyoPayloadBuilder({ schema }).fields({ nonce: uuid() } as any).build())
  }
  return new XyoBoundWitnessBuilder({ inlinePayloads: true }).payloads(payloads).build()
}

const issueQuery = async (query: XyoBoundWitness = getQuery()): Promise<string> => {
  const api = new XyoArchivistApi(config)
  const response = await api.node('temp').post(query)
  const id = response?.[0]?.[0]
  expect(id).toBeDefined()
  return assertEx(id)
}

const validateAllResponseSchemas = (response: XyoApiEnvelope<XyoPayload | undefined>[][]): boolean => {
  return response
    .flatMap((r) => r)
    .map((r) => (r as unknown as XyoPayload)?.schema)
    .every((s) => s === schema)
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
    let id = '123456789'
    describe('with valid query id', () => {
      beforeEach(async () => {
        id = await issueQuery()
      })
      it.skip('returns the query result', async () => {
        const api = new XyoArchivistApi(config)
        await delay(1000)
        const [_, payload, response] = await api.node().result(id).get('tuple')
        expect(_).toBeUndefined()
        expect(payload).toBeDefined()
        expect((payload as unknown as XyoPayload).schema).toBe(schema)
        expect(response.status).toBe(200)
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
  describe.skip('perform', () => {
    it('creates and issues the query and returns the result', async () => {
      const api = new XyoArchivistApi(config)
      const response = await api.node().perform({}, schema)
      expect(response).toBeDefined()
      expect((response as unknown as XyoPayload).schema).toBe(schema)
    })
  })
  describe.skip('performTransaction', () => {
    describe('with a single BoundWitness', () => {
      describe('with a single Payload', () => {
        it('issues the query and returns the result', async () => {
          const api = new XyoArchivistApi(config)
          const query = [getQuery()]
          const response = await api.node().performTransaction(query)
          expect(response).toBeDefined()
          expect(Array.isArray(response)).toBeTruthy()
          expect(validateAllResponseSchemas(response)).toBeTruthy()
        })
      })
      describe('with a multiple Payloads', () => {
        it('issues the query and returns the result', async () => {
          const api = new XyoArchivistApi(config)
          const query = [getQuery(2)]
          const response = await api.node().performTransaction(query)
          expect(response).toBeDefined()
          expect(Array.isArray(response)).toBeTruthy()
          expect(validateAllResponseSchemas(response)).toBeTruthy()
        })
      })
    })
    describe('with a multiple BoundWitnesses', () => {
      describe('with a single Payload', () => {
        it('issues the query and returns the result', async () => {
          const api = new XyoArchivistApi(config)
          const query = [getQuery(), getQuery()]
          const response = await api.node().performTransaction(query)
          expect(response).toBeDefined()
          expect(Array.isArray(response)).toBeTruthy()
          expect(validateAllResponseSchemas(response)).toBeTruthy()
        })
      })
      describe('with a multiple Payloads', () => {
        it('issues the query and returns the result', async () => {
          const api = new XyoArchivistApi(config)
          const query = [getQuery(2), getQuery(2)]
          const response = await api.node().performTransaction(query)
          expect(response).toBeDefined()
          expect(Array.isArray(response)).toBeTruthy()
          expect(validateAllResponseSchemas(response)).toBeTruthy()
        })
      })
    })
  })
})
