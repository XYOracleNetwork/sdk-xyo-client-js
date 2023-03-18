import assertEx from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AxiosJson } from '@xyo-network/axios'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { uuid } from '@xyo-network/core'
import { getApp } from '@xyo-network/express-node-server'
import { HttpBridge, HttpBridgeConfigSchema, XyoHttpBridgeParams } from '@xyo-network/http-bridge'
import { ArchivistGetQuerySchema, ArchivistInsertQuerySchema } from '@xyo-network/modules'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, XyoPayload } from '@xyo-network/payload-model'
import { AddressPayload, AddressSchema } from '@xyo-network/plugins'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import { Express } from 'express'
import { StatusCodes } from 'http-status-codes'
import { join } from 'path'
import supertest, { SuperTest, Test } from 'supertest'

import { request } from '../../testUtil'

const path = '/Archivist'
const security = { allowAnonymous: true }

describe('/Archivist', () => {
  const account = Account.random()
  let bridge: HttpBridge
  let req: SuperTest<Test>
  let app: Express
  beforeAll(async () => {
    app = await getApp()
    req = supertest(app)
    const serverUri = req.get('/').url
    const discover = await req.get('/')
    const address = assertEx((discover.body.data as XyoPayload[]).find<AddressPayload>((p): p is AddressPayload => p.schema === AddressSchema))
    const nodeUri = `/${address.address}`
    const params: XyoHttpBridgeParams = {
      axios: new AxiosJson({
        baseURL: serverUri,
      }),
      config: { nodeUri, schema: HttpBridgeConfigSchema, security },
    }
    bridge = await HttpBridge.create(params)
    const other = req.get('/')
    const foo = ''
  })
  describe('GET', () => {
    it('issues Discover query', async () => {
      const response = await req.get(path).redirects(1).expect(StatusCodes.OK)
      expect(response.body.data).toBeArray()
      const data: Payload[] = response.body.data
      expect(data).toBeArray()
      validateDiscoverResponseContainsQuerySchemas(data, [ArchivistGetQuerySchema, ArchivistInsertQuerySchema])
    })
  })
  describe('POST', () => {
    describe('ArchivistInsertQuerySchema', () => {
      describe('with BoundWitness', () => {
        it('inserts BoundWitness', async () => {
          const payload = new PayloadBuilder({ schema: 'network.xyo.debug' }).fields({ nonce: uuid() }).build()
          const boundWitness = new BoundWitnessBuilder().payload(payload).witness(account).build()
          const response = await (await request()).post(path).send().redirects(1).expect(StatusCodes.OK)
          expect(response.body.data).toBeArray()
          const data: Payload[] = response.body.data
          expect(data).toBeArray()
        })
      })
    })
  })
})

// TODO: Move to helpers lib
const validateDiscoverResponseContainsQuerySchemas = (response: XyoPayload[], querySchemas: string[]) => {
  const queries = response.filter<QueryPayload>((p): p is QueryPayload => p.schema === QuerySchema)
  expect(queries.length).toBeGreaterThan(0)
  querySchemas.forEach((querySchema) => {
    expect(queries.some((p) => p.query === querySchema)).toBeTrue()
  })
}
