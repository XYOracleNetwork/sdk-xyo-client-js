export * from '@xyo-network/blockchain-plugins'
export * from '@xyo-network/crypto-plugins'
export * from '@xyo-network/domain-plugin'
export * from '@xyo-network/elevation-plugin'
export * from '@xyo-network/id-plugin'
export * from '@xyo-network/location-certainty-plugin'
export * from '@xyo-network/location-plugin'
export * from '@xyo-network/module-instance-plugin'
export * from '@xyo-network/pentair-plugin'
export * from '@xyo-network/schema-payload-plugin'
export * from '@xyo-network/system-payload-plugins'

import { XyoBlockchainPlugins } from '@xyo-network/blockchain-plugins'
import { XyoCryptoPlugins } from '@xyo-network/crypto-plugins'
import { DomainPlugin } from '@xyo-network/domain-plugin'
import { ElevationPlugin } from '@xyo-network/elevation-plugin'
import { IdPlugin } from '@xyo-network/id-plugin'
import { LocationCertaintyPlugin } from '@xyo-network/location-certainty-plugin'
import { LocationPlugin } from '@xyo-network/location-plugin'
import { XyoModuleInstancePlugin } from '@xyo-network/module-instance-plugin'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'
import { XyoPentairScreenlogicPlugin } from '@xyo-network/pentair-plugin'
import { XyoSchemaPlugin } from '@xyo-network/schema-payload-plugin'
import { XyoSystemPlugins } from '@xyo-network/system-payload-plugins'

export const PayloadSetPlugins: PayloadSetPluginFunc[] = [
  ...XyoSystemPlugins,
  ...XyoBlockchainPlugins,
  ...XyoCryptoPlugins,
  DomainPlugin,
  ElevationPlugin,
  IdPlugin,
  XyoPentairScreenlogicPlugin,
  LocationPlugin,
  XyoModuleInstancePlugin,
  XyoSchemaPlugin,
  LocationCertaintyPlugin,
]

// eslint-disable-next-line import/no-default-export
export default PayloadSetPlugins
