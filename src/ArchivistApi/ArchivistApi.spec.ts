import { AxiosError } from 'axios'

import { XyoAddress } from '../Address'
import { XyoBoundWitnessBuilder } from '../BoundWitness'
import { XyoBoundWitness, XyoPayload } from '../models'
import { XyoArchivistApi } from './ArchivistApi'
import { XyoArchivistApiConfig } from './ArchivistApiConfig'

const payload: XyoPayload = {
  number_field: 1,
  object_field: {
    number_value: 2,
    string_value: 'yo',
  },
  schema: 'network.xyo.test',
  string_field: 'there',
  timestamp: 1618603439107,
}

const config: XyoArchivistApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'https://api.archivist.xyo.network',
  archive: 'test',
}

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
    it('posts a single bound witness', async () => {
      const builder = new XyoBoundWitnessBuilder({ inlinePayloads: true })
        .witness(XyoAddress.random(), null)
        .payload('network.xyo.test', payload)
      const api = XyoArchivistApi.get(config)
      const boundWitness: XyoBoundWitness = builder.build()

      try {
        const postBoundWitnessResult = await api.postBoundWitness(boundWitness)
        expect(postBoundWitnessResult.boundWitnesses).toEqual(1)
        expect(postBoundWitnessResult.payloads).toEqual(1)
      } catch (ex) {
        const error = ex as AxiosError
        console.log(JSON.stringify(error.response?.data, null, 2))
        throw ex
      }
    }, 40000)
  })
  describe('postBoundWitnesses', () => {
    it('posts multiple bound witnesses', async () => {
      const builder = new XyoBoundWitnessBuilder({ inlinePayloads: true })
        .witness(XyoAddress.random(), null)
        .payload('network.xyo.test', payload)
      const api = XyoArchivistApi.get(config)
      const json = builder.build()
      const boundWitnesses: XyoBoundWitness[] = [json, json]
      try {
        const postBoundWitnessesResult = await api.postBoundWitnesses(boundWitnesses)
        expect(postBoundWitnessesResult.boundWitnesses).toEqual(2)
        expect(postBoundWitnessesResult.payloads).toEqual(2)
      } catch (ex) {
        const error = ex as AxiosError
        console.log(JSON.stringify(error.response?.data, null, 2))
        throw ex
      }
    }, 40000)
  })
})
