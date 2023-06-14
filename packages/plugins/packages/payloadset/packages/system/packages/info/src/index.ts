export * from '@xyo-network/bowser-system-info-payload-plugin'

import { BowserSystemInfoPlugin } from '@xyo-network/bowser-system-info-plugin'
import { NodeSystemInfoPlugin } from '@xyo-network/node-system-info-plugin'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export const SystemInfoPlugins: PayloadSetPluginFunc[] = [BowserSystemInfoPlugin, NodeSystemInfoPlugin]

// eslint-disable-next-line import/no-default-export
export default SystemInfoPlugins
