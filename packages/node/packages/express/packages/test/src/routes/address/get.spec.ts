import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import { request } from '../../testUtil'

describe('/:address', () => {
  let url = ''
  beforeAll(async () => {
    const result = await (await request()).get('/')
    const node: XyoPayloads = result.body.data
    expect(node).toBeArray()
    const parentAddress = ''
    const child = node.find((p) => p.schema === AddressSchema && (p as AddressPayload)?.address !== parentAddress) as AddressPayload
    const address = child.address
    expect(address).toBeString()
    url = `/${address}`
  })
  it(`returns ${ReasonPhrases.OK}`, async () => {
    const result = await (await request()).get(url)
    expect(result.status).toBe(StatusCodes.OK)
  })
  it('returns the address for the module', async () => {
    const result = await (await request()).get(url)
    const data = result.body.data as XyoPayload[]
    expect(data).toBeArray()
    expect(data.length).toBeGreaterThan(0)
    const addressPayload = data.find((p) => p.schema === AddressSchema) as AddressPayload
    expect(addressPayload).toBeObject()
    expect(addressPayload.address).toBeString()
    const { address } = addressPayload
    return { address }
  })
  it('returns the supported queries for the module', async () => {
    const result = await (await request()).get(url)
    const data = result.body.data as XyoPayload[]
    expect(data).toBeArray()
    expect(data.length).toBeGreaterThan(0)
    const queries = data.filter((d) => d.schema === QuerySchema) as QueryPayload[]
    expect(queries.length).toBeGreaterThan(0)
  })
})
