export * from '@xyo-network/bowser-system-info-payload-plugin'

import { BowserSystemInfoPayloadPlugin } from '@xyo-network/bowser-system-info-payload-plugin'
import { PayloadPluginFunc } from '@xyo-network/payload-plugin'

export const SystemInfoPayloadPlugins: PayloadPluginFunc[] = [BowserSystemInfoPayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default SystemInfoPayloadPlugins
