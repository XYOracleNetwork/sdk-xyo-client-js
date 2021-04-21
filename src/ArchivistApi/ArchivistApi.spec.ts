/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */
import { XyoBoundWitnessBuilder } from '../BoundWitnessBuilder'
import ArchivistApi from './ArchivistApi'
import ArchivistApiConfig from './ArchivistApiConfig'

interface TestPayload {
  numberField: number
  objectField: {
    numberValue: number
    stringValue: string
  }
  stringField: string
  timestamp: number
}

test('checking happy path', async () => {
  const payload: TestPayload = {
    timestamp: 1618603439107,
    numberField: 1,
    objectField: {
      numberValue: 2,
      stringValue: 'yo',
    },
    stringField: 'there',
  }

  const config: ArchivistApiConfig = {
    archive: 'test',
    apiDomain: 'http://localhost:3030/dev',
  }

  let builder = new XyoBoundWitnessBuilder()
  expect(builder).toBeDefined()
  builder = builder.witness('1234567890', null)
  expect(builder).toBeDefined()

  builder = builder.payload('network.xyo.test', payload)
  expect(builder).toBeDefined()

  const json = builder.build()
  expect(json).toBeDefined()

  const api = ArchivistApi.get(config)
  expect(api).toBeDefined()
  expect(api.authenticated).toEqual(false)
  const postBoundWitnessResult = await api.postBoundWitness(json)
  expect(postBoundWitnessResult).toEqual(1)
  const postBoundWitnessesResult = await api.postBoundWitnesses([json, json])
  expect(postBoundWitnessesResult).toEqual(2)
})
