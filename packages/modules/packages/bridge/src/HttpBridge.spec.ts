import { ArchivistWrapper } from '@xyo-network/archivist'
import { uuid } from '@xyo-network/core'
import { PayloadWrapper } from '@xyo-network/payload'
import { Axios } from 'axios'

import { HttpBridgeConfigSchema, XyoHttpBridge } from './HttpBridge'

test('XyoHttpBridge', async () => {
  const nodeUri = `${process.env.API_DOMAIN}` ?? 'https://beta.api.archivist.xyo.network'
  const targetAddress = 'temp'

  const bridge = await XyoHttpBridge.create({
    axios: new Axios(),
    config: { nodeUri, schema: HttpBridgeConfigSchema, targetAddress },
  })
  const wrapper = new ArchivistWrapper(bridge)
  const debugPayload = {
    nonce: uuid(),
    schema: 'network.xyo.debug',
  }
  const result = await wrapper.insert([debugPayload])
  console.log(result)
  //expect(result).toBeDefined()
  await wrapper.get([new PayloadWrapper(debugPayload).hash])
  //expect(result2).toBeDefined()
})
