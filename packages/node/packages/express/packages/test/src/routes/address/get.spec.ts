import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { Payload } from '@xyo-network/payload-model'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import { getRequestClient, validateDiscoverResponse } from '../../testUtil'

describe('/:address', () => {
  let url = ''
  const client = getRequestClient()
  beforeAll(async () => {
    const result = await client.get('/')
    const node: Payload[] = result.data.data
    expect(node).toBeArray()
    const parentAddress = ''
    const child = node.find((p) => p.schema === AddressSchema && (p as AddressPayload)?.address !== parentAddress) as AddressPayload
    const address = child.address
    expect(address).toBeString()
    url = `/${address}`
  })
  it(`returns ${ReasonPhrases.OK}`, async () => {
    const result = await client.get(url)
    expect(result.status).toBe(StatusCodes.OK)
  })
  it('returns the discover query for the module', async () => {
    const result = await client.get(url)
    const data = result.data.data as Payload[]
    validateDiscoverResponse(data)
  })
})
