import { BoundWitnessBuilder, XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { XyoSchemaPayload } from '@xyo-network/schema-payload-plugin'

import { claimArchive, getArchiveSchemaRecent, getTokenForUnitTestUser, postBlock, unitTestSigningAccount } from '../../../../../testUtil'

const schemaToAdd = 5

describe('/archive/:archive/schema/recent', () => {
  const schema = 'network.xyo.schema'
  const definition = { $schema: 'http://json-schema.org/draft-07/schema#' }
  let token = ''
  let archive = ''
  let otherArchive = ''

  beforeAll(async () => {
    token = await getTokenForUnitTestUser()
    archive = (await claimArchive(token)).archive
    otherArchive = (await claimArchive(token)).archive

    // NOTE: POST in parallel to speed up test
    const posted = [
      // POST Payloads to test archive
      new Array(schemaToAdd).fill(null).map(async () => {
        const [bw] = new BoundWitnessBuilder<XyoBoundWitness, XyoSchemaPayload>({ inlinePayloads: true })
          .payload({ definition, schema })
          .witness(unitTestSigningAccount)
          .build()
        const response = await postBlock(bw, archive)
        expect(response).toBeTruthy()
      }),
      // Post some payloads to another archive
      new Array(schemaToAdd).fill(null).map(async () => {
        const [bw] = new BoundWitnessBuilder<XyoBoundWitness, XyoSchemaPayload>({ inlinePayloads: true })
          .payload({ definition, schema })
          .witness(unitTestSigningAccount)
          .build()
        const response = await postBlock(bw, otherArchive)
        expect(response).toBeTruthy()
      }),
    ]
    await Promise.all(posted.flatMap((p) => p))
  })
  it('Gets recently uploaded schema for the archive', async () => {
    const response = (await getArchiveSchemaRecent(archive)) as XyoPayloadWithMeta<XyoSchemaPayload>[]
    expect(response).toBeTruthy()
    expect(Array.isArray(response)).toBeTruthy()
    expect(response.length).toBe(schemaToAdd)
    response.forEach((payload) => {
      expect(payload._archive).toBe(archive)
      expect(payload.schema).toBe(schema)
      expect(payload.definition).toStrictEqual(definition)
    })
  })
})
