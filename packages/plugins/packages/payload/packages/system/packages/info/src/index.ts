export * from '@xyo-network/bowser-system-info-payload-plugin'

import { BowserSystemInfoPayloadPlugin } from '@xyo-network/bowser-system-info-payload-plugin'
import { NodeSystemInfoPayloadPlugin } from '@xyo-network/node-system-info-payload-plugin'
import { PayloadPluginFunc } from '@xyo-network/payload-plugin'

export const SystemInfoPayloadPlugins: PayloadPluginFunc[] = [BowserSystemInfoPayloadPlugin, NodeSystemInfoPayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default SystemInfoPayloadPlugins
