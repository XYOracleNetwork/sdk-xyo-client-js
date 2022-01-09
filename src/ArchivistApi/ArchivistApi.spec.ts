import { AxiosError } from 'axios'

import { XyoAddress } from '../Address'
import { XyoBoundWitnessBuilder } from '../BoundWitness'
import { XyoBoundWitness, XyoPayload } from '../models'
import { XyoArchivistApi } from './ArchivistApi'
import { XyoArchivistApiConfig } from './ArchivistApiConfig'

const schema = 'network.xyo.test'
const payload: XyoPayload = {
  number_field: 1,
  object_field: {
    number_value: 2,
    string_value: 'yo',
  },
  schema,
  string_field: 'there',
  timestamp: 1618603439107,
}

const config: XyoArchivistApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'https://api.archivist.xyo.network',
  archive: 'test',
}

const timeout = 20000

describe('XyoArchivistApi', () => {
  describe('get', () => {
    it('returns a new XyoArchivistApi', () => {
      const api = XyoArchivistApi.get(config)
      expect(api).toBeDefined()
    })
    describe('with no token', () => {
      it('is not authenticated', () => {
        const api = XyoArchivistApi.get(config)
        expect(api.authenticated).toEqual(false)
      })
    })
  })
  describe('postBoundWitness', () => {
    it.each([true, false])(
      'posts a single bound witness',
      async (inlinePayloads) => {
        const builder = new XyoBoundWitnessBuilder({ inlinePayloads })
          .witness(XyoAddress.random(), null)
          .payload(schema, payload)
        const api = XyoArchivistApi.get(config)
        const boundWitness: XyoBoundWitness = builder.build()

        try {
          const response = await api.postBoundWitness(boundWitness)
          expect(response.boundWitnesses).toEqual(1)
          if (inlinePayloads) {
            expect(response.payloads).toEqual(1)
          } else {
            expect(response.payloads).toEqual(0)
          }
        } catch (ex) {
          const error = ex as AxiosError
          console.log(JSON.stringify(error.response?.data, null, 2))
          throw ex
        }
      },
      timeout
    )
  })
  describe('postBoundWitnesses', () => {
    it.each([true, false])(
      'posts multiple bound witnesses',
      async (inlinePayloads) => {
        const builder = new XyoBoundWitnessBuilder({ inlinePayloads })
          .witness(XyoAddress.random(), null)
          .payload(schema, payload)
        const api = XyoArchivistApi.get(config)
        const json = builder.build()
        const boundWitnesses: XyoBoundWitness[] = [json, json]
        try {
          const response = await api.postBoundWitnesses(boundWitnesses)
          expect(response.boundWitnesses).toEqual(2)
          if (inlinePayloads) {
            expect(response.payloads).toEqual(2)
          } else {
            expect(response.payloads).toEqual(0)
          }
        } catch (ex) {
          const error = ex as AxiosError
          console.log(JSON.stringify(error.response?.data, null, 2))
          throw ex
        }
      },
      timeout
    )
  })
})
