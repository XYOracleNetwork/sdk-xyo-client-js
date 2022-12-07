export * from '@xyo-network/pentair-payload-plugin'

import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoPentairScreenlogicPayloadPlugin } from '@xyo-network/pentair-payload-plugin'

export const PayloadPlugins: XyoPayloadPluginFunc[] = [XyoPentairScreenlogicPayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default PayloadPlugins
