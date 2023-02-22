import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { ModuleDiscoverQuerySchema, QueryBoundWitnessBuilder } from '@xyo-network/modules'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayload } from '@xyo-network/payload-model'
import { AddressPayload, AddressSchema } from '@xyo-network/plugins'
import { StatusCodes } from 'http-status-codes'

import { request } from '../../testUtil'

describe('Node API', () => {
  const account = Account.random()
  const validateModuleDiscoverQueryResponse = (data: XyoPayload[]) => {
    expect(data).toBeArray()
    expect(data.length).toBeGreaterThan(0)
    const addressPayload = data.find((p) => p.schema === AddressSchema) as AddressPayload
    expect(addressPayload).toBeObject()
    expect(addressPayload.address).toBeString()
    const { address } = addressPayload
    return { address }
  }
  describe('/', () => {
    const path = '/node'
    describe('GET', () => {
      it('returns node describe', async () => {
        const response = await (await request()).get(path).redirects(1).expect(StatusCodes.OK)
        validateModuleDiscoverQueryResponse(response.body.data)
      })
    })
    describe('POST', () => {
      it('issues query to Node', async () => {
        const queryPayload = new XyoPayloadBuilder({ schema: ModuleDiscoverQuerySchema }).build()
        const query = new QueryBoundWitnessBuilder({ inlinePayloads: true }).witness(account).query(queryPayload).build()
        const send = [query[0], [...query[1]]]
        const response = await (await request()).post(path).send(send).redirects(1).expect(StatusCodes.OK)
        const { data } = response.body
        expect(data).toBeTruthy()
        const [bw, payloads] = data
        expect(bw).toBeObject()
        expect(bw.schema).toBe(XyoBoundWitnessSchema)
        validateModuleDiscoverQueryResponse(payloads)
      })
    })
  })
  describe('/<address>', () => {
    let path = '/node'
    beforeAll(async () => {
      // TODO: GEt modules and update path
      const response = await (await request()).get(path).redirects(1).expect(StatusCodes.OK)
      const address = assertEx(response.body.data.children?.[0]?.address, 'Missing address from child module')
      path = `/node/${address}`
    })
    describe('GET', () => {
      it('returns module describe', async () => {
        const response = await (await request()).get(path).redirects(1).expect(StatusCodes.OK)
        const { data } = response.body
        expect(data).toBeTruthy()
        expect(data.address).toBeString()
        expect(data.name).toBeString()
        expect(data.queries).toBeArray()
        expect(data.queries.length).toBeGreaterThan(0)
      })
      it('can get Node by address', async () => {
        const nodeResponse = await (await request()).get('/node').expect(StatusCodes.OK)
        const { data } = nodeResponse.body
        expect(data).toBeTruthy()
        expect(data.address).toBeString()
        const nodeAddress = data.address
        const response = await (await request()).get(`/node/${nodeAddress}`).expect(StatusCodes.OK)
        validateModuleDiscoverQueryResponse(response.body.data)
      })
    })
    describe('POST', () => {
      it('issues query to module at address', async () => {
        const queryPayload = new XyoPayloadBuilder({ schema: ModuleDiscoverQuerySchema }).build()
        const query = new QueryBoundWitnessBuilder({ inlinePayloads: true }).witness(account).query(queryPayload).build()
        const send = [query[0], [...query[1]]]
        const response = await (await request()).post(path).send(send).expect(StatusCodes.OK)
        const { data } = response.body
        expect(data).toBeTruthy()
        const [bw, payloads] = data
        expect(bw).toBeObject()
        expect(bw.schema).toBe(XyoBoundWitnessSchema)
        expect(payloads).toBeArray()
        expect(payloads.length).toBeGreaterThan(0)
      })
    })
  })
})
