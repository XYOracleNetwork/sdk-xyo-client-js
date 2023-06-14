export * from '@xyo-network/blockchain-plugins'
export * from '@xyo-network/crypto-plugins'
export * from '@xyo-network/domain-plugin'
export * from '@xyo-network/elevation-plugin'
export * from '@xyo-network/id-plugin'
export * from '@xyo-network/location-certainty-plugin'
export * from '@xyo-network/location-plugin'
export * from '@xyo-network/module-instance-plugin'
export * from '@xyo-network/schema-plugin'
export * from '@xyo-network/system-plugins'

import { BlockchainPlugins } from '@xyo-network/blockchain-plugins'
import { CryptoPlugins } from '@xyo-network/crypto-plugins'
import { DomainPlugin } from '@xyo-network/domain-plugin'
import { ElevationPlugin } from '@xyo-network/elevation-plugin'
import { IdPlugin } from '@xyo-network/id-plugin'
import { LocationCertaintyPlugin } from '@xyo-network/location-certainty-plugin'
import { LocationPlugin } from '@xyo-network/location-plugin'
import { AbstractModuleInstancePlugin } from '@xyo-network/module-instance-plugin'
import { PayloadSetPluginFunc } from '@xyo-network/payloadset-plugin'
import { SchemaPlugin } from '@xyo-network/schema-plugin'
import { SystemPlugins } from '@xyo-network/system-plugins'

export const PayloadSetPlugins: PayloadSetPluginFunc[] = [
  ...SystemPlugins,
  ...BlockchainPlugins,
  ...CryptoPlugins,
  DomainPlugin,
  ElevationPlugin,
  IdPlugin,
  LocationPlugin,
  AbstractModuleInstancePlugin,
  SchemaPlugin,
  LocationCertaintyPlugin,
]

// eslint-disable-next-line import/no-default-export
export default PayloadSetPlugins
