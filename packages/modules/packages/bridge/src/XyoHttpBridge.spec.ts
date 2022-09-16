import { XyoArchivistWrapper } from '@xyo-network/archivist'
import { uuid } from '@xyo-network/core'
import { XyoPayloadWrapper } from '@xyo-network/payload'

import { XyoArchivistHttpBridge } from './XyoArchivistHttpBridge'

test('XyoHttpBridge', async () => {
  const nodeUri = `${process.env.API_DOMAIN}` ?? 'https://beta.api.archivist.xyo.network'
  const targetAddress = 'temp'
  const bridge = new XyoArchivistHttpBridge({ nodeUri, targetAddress })
  const wrapper = new XyoArchivistWrapper(bridge)
  const debugPayload = {
    nonce: uuid(),
    schema: 'network.xyo.debug',
  }
  const result = await wrapper.insert([debugPayload])
  console.log(result)
  //expect(result).toBeDefined()
  await wrapper.get([new XyoPayloadWrapper(debugPayload).hash])
  //expect(result2).toBeDefined()
})
