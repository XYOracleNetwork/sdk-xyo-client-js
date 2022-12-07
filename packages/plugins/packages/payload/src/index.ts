export * from '@xyo-network/blockchain-payload-plugins'
export * from '@xyo-network/crypto-payload-plugins'
export * from '@xyo-network/domain-payload-plugin'
export * from '@xyo-network/elevation-payload-plugin'
export * from '@xyo-network/id-payload-plugin'
export * from '@xyo-network/location-certainty-payload-plugin'
export * from '@xyo-network/location-payload-plugin'
export * from '@xyo-network/module-instance-payload-plugin'
export * from '@xyo-network/pentair-payload-plugin'
export * from '@xyo-network/schema-payload-plugin'
export * from '@xyo-network/system-payload-plugins'

import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoPentairScreenlogicPayloadPlugin } from '@xyo-network/pentair-payload-plugin'

export const PayloadPlugins: XyoPayloadPluginFunc[] = [XyoPentairScreenlogicPayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default PayloadPlugins
