import { XyoArchivistWrapper } from '@xyo-network/archivist'
import { uuid } from '@xyo-network/core'
import { XyoPayloadWrapper } from '@xyo-network/payload'

import { XyoHttpBridge } from './XyoHttpBridge'

test('XyoHttpBridge', async () => {
  const uri = `${process.env.API_DOMAIN}` ?? 'https://beta.api.archivist.xyo.network'
  const archive = 'temp'
  const bridge = new XyoHttpBridge({ archive, uri })
  const wrapper = new XyoArchivistWrapper(bridge)
  const debugPayload = {
    nonce: uuid(),
    schema: 'network.xyo.debug',
  }
  const result = await wrapper.insert([debugPayload])
  console.log(result)
  expect(result).toBeDefined()
  const result2 = await wrapper.get([new XyoPayloadWrapper(debugPayload).hash])
  expect(result2).toBeDefined()
})
