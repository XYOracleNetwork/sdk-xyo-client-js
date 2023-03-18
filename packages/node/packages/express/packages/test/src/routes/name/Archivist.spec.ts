import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AxiosJson } from '@xyo-network/axios'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { uuid } from '@xyo-network/core'
import { getApp } from '@xyo-network/express-node-server'
import { HttpBridge, HttpBridgeConfigSchema, XyoHttpBridgeParams } from '@xyo-network/http-bridge'
import { ArchivistGetQuerySchema, ArchivistInsertQuerySchema, ArchivistWrapper } from '@xyo-network/modules'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, XyoPayload } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import { Express } from 'express'
import { StatusCodes } from 'http-status-codes'
import supertest, { SuperTest, Test } from 'supertest'

import { request } from '../../testUtil'

const name = ['Archivist']
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
    const baseURL = req.get('/').url
    // const discover = await req.get('/')
    // const address = assertEx((discover.body.data as XyoPayload[]).find<AddressPayload>((p): p is AddressPayload => p.schema === AddressSchema))
    const nodeUri = '/node'
    const params: XyoHttpBridgeParams = {
      axios: new AxiosJson({ baseURL }),
      config: { nodeUri, schema: HttpBridgeConfigSchema, security },
    }
    bridge = await HttpBridge.create(params)
  })
  describe('Discover', () => {
    it('issues Discover query', async () => {
      const modules = await bridge.downResolver.resolve({ name })
      expect(modules).toBeArrayOfSize(1)
      const mod = modules.pop()
      expect(mod).toBeTruthy()
      const archivist = ArchivistWrapper.wrap(mod)
      const discover = await archivist.discover()
      expect(discover).toBeArray()
      validateDiscoverResponseContainsQuerySchemas(discover, [ArchivistGetQuerySchema, ArchivistInsertQuerySchema])
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
