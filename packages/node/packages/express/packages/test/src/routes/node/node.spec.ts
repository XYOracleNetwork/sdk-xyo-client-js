import { Account } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { ModuleDiscoverQuerySchema, QueryBoundWitnessBuilder, XyoQueryBoundWitness } from '@xyo-network/modules'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { StatusCodes } from 'http-status-codes'

import { request } from '../../testUtil'

describe('Node API', () => {
  const account = Account.random()
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {
      // Stop expected logs from being generated during tests
    })
  })
  describe('/', () => {
    const path = '/node'
    describe('GET', () => {
      it('returns node describe', async () => {
        const data = await getModuleResponse()
        validateModuleDiscoverQueryResponse(data)
      })
    })
    describe('POST', () => {
      it('issues query to Node', async () => {
        const queryPayload = new PayloadBuilder({ schema: ModuleDiscoverQuerySchema }).build()
        const query = new QueryBoundWitnessBuilder({ inlinePayloads: true }).witness(account).query(queryPayload).build()
        const send = [query[0], [...query[1]]]
        const response = await (await request()).post(path).send(send).redirects(1).expect(StatusCodes.OK)
        const { data } = response.body
        expect(data).toBeTruthy()
        const [bw, payloads] = data
        expect(bw).toBeObject()
        expect(bw.schema).toBe(BoundWitnessSchema)
        validateModuleDiscoverQueryResponse(payloads)
      })
    })
  })
  describe('/<address>', () => {
    let address: string | undefined = undefined
    beforeAll(async () => {
      const data = await getModuleResponse()
      const { address: parentAddress } = validateModuleDiscoverQueryResponse(data)
      const child = data.find((p) => p.schema === AddressSchema && (p as AddressPayload)?.address !== parentAddress) as AddressPayload
      address = child.address
    })
    describe('GET', () => {
      it('returns module describe', async () => {
        const data = await getModuleResponse(address)
        validateModuleDiscoverQueryResponse(data)
      })
      it('can get Node by address', async () => {
        const nodeResponse = await getModuleResponse()
        const { address: nodeAddress } = validateModuleDiscoverQueryResponse(nodeResponse)
        const response = await getModuleResponse(nodeAddress)
        validateModuleDiscoverQueryResponse(response)
      })
    })
    describe('POST', () => {
      it('issues query to module at address', async () => {
        const queryPayload = new PayloadBuilder({ schema: ModuleDiscoverQuerySchema }).build()
        const query = new QueryBoundWitnessBuilder({ inlinePayloads: true }).witness(account).query(queryPayload).build()
        const data = [query[0], [...query[1]]] as [XyoQueryBoundWitness, Payload[]]
        await postModuleQuery(data, address)
      })
    })
  })
})

const validateModuleDiscoverQueryResponse = (data: Payload[]) => {
  expect(data).toBeArray()
  expect(data.length).toBeGreaterThan(0)
  const addressPayload = data.find((p) => p.schema === AddressSchema) as AddressPayload
  expect(addressPayload).toBeObject()
  expect(addressPayload.address).toBeString()
  const { address } = addressPayload
  return { address }
}

const getModuleResponse = async (address?: string): Promise<Payload[]> => {
  const path = address ? `/node/${address}` : '/node'
  const redirects = address ? 0 : 1
  const response = await (await request()).get(path).redirects(redirects).expect(StatusCodes.OK)
  expect(response).toBeTruthy()
  expect(response.body).toBeTruthy()
  expect(response.body.data).toBeArray()
  return response.body.data as Payload[]
}

const postModuleQuery = async (data: [XyoQueryBoundWitness, Payload[]], address?: string): Promise<[BoundWitness, Payload[]]> => {
  const path = address ? `/node/${address}` : '/node'
  const redirects = address ? 0 : 1
  const response = await (await request()).post(path).redirects(redirects).send(data).expect(StatusCodes.OK)
  expect(response).toBeTruthy()
  expect(response.body).toBeTruthy()
  expect(response.body.data).toBeArray()
  const [bw, payloads] = response.body.data
  expect(bw).toBeObject()
  expect(bw.schema).toBe(BoundWitnessSchema)
  expect(payloads).toBeArray()
  expect(payloads.length).toBeGreaterThan(0)
  return [bw, payloads]
}
