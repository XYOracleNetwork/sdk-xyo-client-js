import { assertEx } from '@xylabs/assert'
import { ModuleDiscoverQuerySchema, QueryBoundWitnessBuilder } from '@xyo-network/modules'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { StatusCodes } from 'http-status-codes'

import { request } from '../../testUtil'

describe('Node API', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateNodeGetResponse = (data: any) => {
    expect(data).toBeTruthy()
    expect(data.address).toBeString()
    expect(data.queries).toBeArray()
    expect(data.queries.length).toBeGreaterThan(0)
    expect(data.children).toBeArray()
    expect(data.children.length).toBeGreaterThan(0)
  }
  describe('/', () => {
    const path = '/node'
    describe('GET', () => {
      it('returns node describe', async () => {
        const response = await (await request()).get(path).expect(StatusCodes.OK)
        validateNodeGetResponse(response.body.data)
      })
    })
    describe('POST', () => {
      it.only('issues query to Node', async () => {
        const queryPayload = new XyoPayloadBuilder({ schema: ModuleDiscoverQuerySchema }).build()
        const query = new QueryBoundWitnessBuilder({ inlinePayloads: true }).query(queryPayload).build()
        const send = [query[0], [...query[1]]]
        const response = await (await request()).post(path).send(send).expect(StatusCodes.OK)
      })
    })
  })
  describe('/<address>', () => {
    let path = '/node'
    beforeAll(async () => {
      // TODO: GEt modules and update path
      const response = await (await request()).get(path).expect(StatusCodes.OK)
      const address = assertEx(response.body.data.children?.[0]?.address, 'Missing address from child module')
      path = `/node/${address}`
    })
    describe('GET', () => {
      it('returns module describe', async () => {
        const response = await (await request()).get(path).expect(StatusCodes.OK)
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
        // NOTE: We can't do this yet as NodeWrapper overrides and we don't want to be module aware as to which type of wrapper to use
        // validateNodeGetResponse(response.body.data)
      })
    })
    describe('POST', () => {
      it('issues query to module at address', async () => {
        // TODO: Test
      })
    })
  })
})
