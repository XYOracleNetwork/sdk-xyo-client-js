export * from '@xyo-network/blockchain-payload-plugins'
export * from '@xyo-network/crypto-payload-plugins'
export * from '@xyo-network/domain-payload-plugin'
export * from '@xyo-network/id-payload-plugin'
export * from '@xyo-network/location-certainty-payload-plugin'
export * from '@xyo-network/location-payload-plugin'
export * from '@xyo-network/pentair-payload-plugin'

import { XyoBlockchainPayloadPlugins } from '@xyo-network/blockchain-payload-plugins'
import { CryptoPayloadPlugins } from '@xyo-network/crypto-payload-plugins'
import { DomainPayloadPlugin } from '@xyo-network/domain-payload-plugin'
import { IdPayloadPlugin } from '@xyo-network/id-payload-plugin'
import { LocationCertaintyPayloadPlugin } from '@xyo-network/location-certainty-payload-plugin'
import { LocationPayloadPlugin } from '@xyo-network/location-payload-plugin'
import { ModuleInstancePayloadPlugin } from '@xyo-network/module-instance-payload-plugin'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoPentairScreenlogicPayloadPlugin } from '@xyo-network/pentair-payload-plugin'

export const PayloadPlugins: XyoPayloadPluginFunc[] = [
  XyoPentairScreenlogicPayloadPlugin,
  LocationPayloadPlugin,
  LocationCertaintyPayloadPlugin,
  DomainPayloadPlugin,
  IdPayloadPlugin,
  ModuleInstancePayloadPlugin,
  ...XyoBlockchainPayloadPlugins,
  ...CryptoPayloadPlugins,
]

// eslint-disable-next-line import/no-default-export
export default PayloadPlugins
