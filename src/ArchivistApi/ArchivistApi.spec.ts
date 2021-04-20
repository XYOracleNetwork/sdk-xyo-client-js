/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */
import { XyoBoundWitnessBuilder } from '../BoundWitnessBuilder'
import { XyoPayloadMeta } from '../models'
import ArchivistApi from './ArchivistApi'
import ArchivistApiConfig from './ArchivistApiConfig'

interface TestPayload extends XyoPayloadMeta {
  numberField: number
  objectField: {
    numberValue: number
    stringValue: string
  }
  stringField: string
}

test('checking happy path', async () => {
  let builder = new XyoBoundWitnessBuilder<TestPayload>()
  expect(builder).toBeDefined()
  builder = builder.witness('1234567890', null)
  expect(builder).toBeDefined()
  const payload = {
    _schema: 'network.xyo.test',
    _timestamp: 1618603439107,
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

  const json = builder.build(payload)
  expect(json).toBeDefined()

  const api = ArchivistApi.get(config)
  expect(api).toBeDefined()
  expect(api.authenticated).toEqual(false)
  const postBoundWitnessResult = await api.postBoundWitness(json)
  console.log(`r1: ${JSON.stringify(postBoundWitnessResult)}`)
  expect(postBoundWitnessResult).toEqual(1)
  const postBoundWitnessesResult = await api.postBoundWitnesses([json, json])
  console.log(`r2: ${JSON.stringify(postBoundWitnessesResult)}`)
  expect(postBoundWitnessesResult).toEqual(2)
})
