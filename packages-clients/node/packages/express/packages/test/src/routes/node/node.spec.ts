import { Account } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { QueryBoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness, BoundWitnessSchema, QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { ModuleDiscoverQuerySchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

import { getRequestClient, validateDiscoverResponse } from '../../testUtil'

describe('Node API', () => {
  const account = Account.randomSync()
  const client = getRequestClient()
  const path = '/node'
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {
      // Stop expected logs from being generated during tests
    })
  })
  describe('/node', () => {
    describe('GET', () => {
      it('returns node describe', async () => {
        const response = await client.get(path)
        const data = response.data.data
        validateDiscoverResponse(data)
      })
    })
    describe('POST', () => {
      it('issues query to Node', async () => {
        const queryPayload = new PayloadBuilder({ schema: ModuleDiscoverQuerySchema }).build()
        const query = await new QueryBoundWitnessBuilder({ inlinePayloads: true }).witness(account).query(queryPayload).build()
        const send = [query[0], [...query[1]]]
        const response = await client.post(path, send)
        const data = response.data.data
        expect(data).toBeTruthy()
        const [bw, payloads] = data
        expect(bw).toBeObject()
        expect(bw.schema).toBe(BoundWitnessSchema)
        validateDiscoverResponse(payloads)
      })
    })
  })
  describe('/<address>', () => {
    let address: string | undefined = undefined
    beforeAll(async () => {
      const response = await client.get<{ data: Payload[] }>(path)
      const data = response.data.data
      const { address: parentAddress } = getModuleAddress(data)
      const child = data.find((p) => p.schema === AddressSchema && (p as AddressPayload)?.address !== parentAddress) as AddressPayload
      address = child.address
    })
    describe('GET', () => {
      it('returns module describe', async () => {
        const response = await client.get<{ data: Payload[] }>(path)
        const data = response.data.data
        validateDiscoverResponse(data)
      })
      it('can get Node by address', async () => {
        const nodeResponse = await client.get<{ data: Payload[] }>(path)
        const data = nodeResponse.data.data
        const { address: nodeAddress } = getModuleAddress(data)
        const response = await client.get<{ data: Payload[] }>(`/${nodeAddress}`)
        validateDiscoverResponse(response.data.data)
      })
    })
    describe('POST', () => {
      const postModuleQuery = async (data: [QueryBoundWitness, Payload[]], address?: string): Promise<[BoundWitness, Payload[]]> => {
        const path = address ? `/node/${address}` : '/node'
        const response = await client.post(path, data)
        expect(response).toBeTruthy()
        expect(response.data.data).toBeArray()
        const [bw, payloads] = response.data.data
        expect(bw).toBeObject()
        expect(bw.schema).toBe(BoundWitnessSchema)
        expect(payloads).toBeArray()
        expect(payloads.length).toBeGreaterThan(0)
        return [bw, payloads]
      }
      it('issues query to module at address', async () => {
        const queryPayload = new PayloadBuilder({ schema: ModuleDiscoverQuerySchema }).build()
        const query = await new QueryBoundWitnessBuilder({ inlinePayloads: true }).witness(account).query(queryPayload).build()
        const data = [query[0], [...query[1]]] as [QueryBoundWitness, Payload[]]
        await postModuleQuery(data, address)
      })
    })
  })
})

const getModuleAddress = (data: Payload[]) => {
  expect(data).toBeArray()
  expect(data.length).toBeGreaterThan(0)
  const addressPayload = data.find((p) => p.schema === AddressSchema) as AddressPayload
  expect(addressPayload).toBeObject()
  expect(addressPayload.address).toBeString()
  const { address } = addressPayload
  return { address }
}
