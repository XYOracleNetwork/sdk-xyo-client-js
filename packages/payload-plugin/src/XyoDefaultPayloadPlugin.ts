import { createXyoPayloadPlugin } from './createPlugin'
import { XyoPayloadPlugin } from './Plugin'

export const XyoDefaultPayloadPlugin: XyoPayloadPlugin<'network.xyo.payload'> = createXyoPayloadPlugin<'network.xyo.payload'>({
  schema: 'network.xyo.payload',
})
