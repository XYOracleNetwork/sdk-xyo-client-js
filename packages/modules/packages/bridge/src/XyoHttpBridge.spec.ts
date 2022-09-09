import { XyoArchivistWrapper } from '@xyo-network/archivist'
import { XyoPayloadWrapper } from '@xyo-network/payload'
import { XyoIdPayload, XyoIdSchema } from '@xyo-network/payload-plugins'

import { XyoHttpBridge } from './XyoHttpBridge'

test('XyoHttpBridge', async () => {
  const bridge = new XyoHttpBridge({ uri: `${process.env.API_DOMAIN}` ?? 'https://beta.api.archivist.xyo.network' })
  const wrapper = new XyoArchivistWrapper(bridge)
  const idPayload: XyoIdPayload = {
    salt: 'test',
    schema: XyoIdSchema,
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const result = await wrapper.insert([idPayload])
  //expect(result).toBeDefined()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const result2 = await wrapper.get([new XyoPayloadWrapper(idPayload).hash])
  //expect(result2).toBeDefined()
})
