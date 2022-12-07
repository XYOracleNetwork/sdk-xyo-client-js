export * from '@xyo-network/blockchain-payload-plugins'
export * from '@xyo-network/crypto-payload-plugins'
export * from '@xyo-network/domain-payload-plugin'
export * from '@xyo-network/elevation-payload-plugin'
export * from '@xyo-network/id-payload-plugin'
export * from '@xyo-network/location-certainty-payload-plugin'
export * from '@xyo-network/location-plugin'
export * from '@xyo-network/module-instance-payload-plugin'
export * from '@xyo-network/pentair-plugin'
export * from '@xyo-network/schema-payload-plugin'
export * from '@xyo-network/system-payload-plugins'

import { XyoBlockchainPlugins } from '@xyo-network/blockchain-payload-plugins'
import { XyoCryptoPlugins } from '@xyo-network/crypto-payload-plugins'
import { XyoDomainPlugin } from '@xyo-network/domain-payload-plugin'
import { XyoLocationElevationPlugin } from '@xyo-network/elevation-payload-plugin'
import { XyoIdPlugin } from '@xyo-network/id-payload-plugin'
import { LocationCertaintyPlugin } from '@xyo-network/location-certainty-payload-plugin'
import { LocationPlugin } from '@xyo-network/location-plugin'
import { XyoModuleInstancePlugin } from '@xyo-network/module-instance-payload-plugin'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'
import { XyoPentairScreenlogicPlugin } from '@xyo-network/pentair-plugin'
import { XyoSchemaPlugin } from '@xyo-network/schema-payload-plugin'
import { XyoSystemPlugins } from '@xyo-network/system-payload-plugins'

export const PayloadSetPlugins: PayloadSetPluginFunc[] = [
  ...XyoSystemPlugins,
  ...XyoBlockchainPlugins,
  ...XyoCryptoPlugins,
  XyoDomainPlugin,
  XyoLocationElevationPlugin,
  XyoIdPlugin,
  XyoPentairScreenlogicPlugin,
  LocationPlugin,
  XyoModuleInstancePlugin,
  XyoSchemaPlugin,
  LocationCertaintyPlugin,
]

// eslint-disable-next-line import/no-default-export
export default PayloadSetPlugins
