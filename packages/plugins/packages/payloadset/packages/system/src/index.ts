export * from '@xyo-network/info-system-plugins'

import { SystemInfoPlugins } from '@xyo-network/info-system-plugins'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export const SystemPlugins: PayloadSetPluginFunc[] = [...SystemInfoPlugins]

// eslint-disable-next-line import/no-default-export
export default SystemPlugins
