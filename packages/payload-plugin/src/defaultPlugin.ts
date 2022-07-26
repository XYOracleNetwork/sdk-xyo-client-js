import { createXyoPayloadPlugin } from './createPlugin'
import { XyoPayloadPlugin } from './Plugin'

export const XyoDefaultPayloadPluginEntry: XyoPayloadPlugin<'network.xyo.payload'> = createXyoPayloadPlugin<'network.xyo.payload'>({
  schema: 'network.xyo.payload',
})
