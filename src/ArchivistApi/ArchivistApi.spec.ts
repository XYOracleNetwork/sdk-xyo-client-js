import { AxiosError } from 'axios'

import { XyoAddress } from '../Address'
import { XyoBoundWitnessBuilder } from '../BoundWitness'
import { XyoPayload } from '../models'
import { XyoArchivistApi } from './ArchivistApi'
import { XyoArchivistApiConfig } from './ArchivistApiConfig'

test('checking happy path', async () => {
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

  const address = XyoAddress.random()

  let builder = new XyoBoundWitnessBuilder()
  expect(builder).toBeDefined()
  builder = builder.witness(address, null)
  expect(builder).toBeDefined()

  builder = builder.payload('network.xyo.test', payload)
  expect(builder).toBeDefined()

  const json = builder.build()
  expect(json).toBeDefined()

  const api = XyoArchivistApi.get(config)
  expect(api).toBeDefined()
  expect(api.authenticated).toEqual(false)
  try {
    const postBoundWitnessResult = await api.postBoundWitness(json)
    expect(postBoundWitnessResult.boundWitnesses).toEqual(1)
  } catch (ex) {
    const error = ex as AxiosError
    console.log(JSON.stringify(error.response?.data, null, 2))
    throw ex
  }
  try {
    const postBoundWitnessesResult = await api.postBoundWitnesses([json, json])
    expect(postBoundWitnessesResult.boundWitnesses).toEqual(2)
  } catch (ex) {
    const error = ex as AxiosError
    console.log(JSON.stringify(error.response?.data, null, 2))
    throw ex
  }
}, 40000)
