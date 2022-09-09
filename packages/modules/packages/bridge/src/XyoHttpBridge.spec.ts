import { XyoArchivistWrapper } from '@xyo-network/archivist'
import { XyoPayloadWrapper } from '@xyo-network/payload'
import { XyoIdPayload, XyoIdSchema } from '@xyo-network/payload-plugins'

import { XyoHttpBridge } from './XyoHttpBridge'

test('XyoHttpBridge', async () => {
  const uri = `${process.env.API_DOMAIN}` ?? 'https://beta.api.archivist.xyo.network'
  const archive = 'temp'
  const bridge = new XyoHttpBridge({ archive, uri })
  const wrapper = new XyoArchivistWrapper(bridge)
  const idPayload: XyoIdPayload = {
    salt: 'test',
    schema: XyoIdSchema,
  }
  const result = await wrapper.insert([idPayload])
  console.log(result)
  expect(result).toBeDefined()
  const result2 = await wrapper.get([new XyoPayloadWrapper(idPayload).hash])
  expect(result2).toBeDefined()
})
