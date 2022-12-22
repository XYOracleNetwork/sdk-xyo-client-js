import { BoundWitnessBuilder, XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { XyoSchemaPayload } from '@xyo-network/schema-payload-plugin'

import { claimArchive, getHash, getSchema, getTokenForUnitTestUser, postBlock, unitTestSigningAccount } from '../../../../testUtil'

describe('/schema/:schema', () => {
  const schema = 'network.xyo.schema'
  const definition = { $schema: 'http://json-schema.org/draft-07/schema#' }
  const [bw] = new BoundWitnessBuilder<XyoBoundWitness, XyoSchemaPayload>({ inlinePayloads: true })
    .payload({ definition, schema })
    .witness(unitTestSigningAccount)
    .build()
  beforeAll(async () => {
    const token = await getTokenForUnitTestUser()
    const archive = (await claimArchive(token)).archive
    await postBlock(bw, archive)
    const payloadHash = bw.payload_hashes[0]
    expect(payloadHash).toBeTruthy()
    const response = await getHash(payloadHash)
    expect(response).toBeTruthy()
    expect(response.schema).toEqual(schema)
  })

  it('Gets information about the schema', async () => {
    const response = await getSchema(schema)
    expect(response).toBeTruthy()
    expect(response.schema).toEqual(schema)
    expect(response.definition.$schema).toEqual(definition.$schema)
  })
})
