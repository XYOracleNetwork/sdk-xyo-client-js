export * from '@xyo-network/node-system-info-plugin'

import { XyoNodeSystemInfoPlugin } from '@xyo-network/node-system-info-plugin'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'

export const XyoSystemInfoPlugins: PayloadSetPluginFunc[] = [XyoNodeSystemInfoPlugin]

// eslint-disable-next-line import/no-default-export
export default XyoSystemInfoPlugins
