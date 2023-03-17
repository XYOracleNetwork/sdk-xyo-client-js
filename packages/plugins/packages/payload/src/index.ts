export * from '@xyo-network/address-payload-plugin'
export * from '@xyo-network/blockchain-payload-plugins'
export * from '@xyo-network/config-payload-plugin'
export * from '@xyo-network/crypto-payload-plugins'
export * from '@xyo-network/domain-payload-plugin'
export * from '@xyo-network/id-payload-plugin'
export * from '@xyo-network/location-certainty-payload-plugin'
export * from '@xyo-network/location-payload-plugin'
export * from '@xyo-network/query-payload-plugin'
export * from '@xyo-network/schema-payload-plugin'

import { AddressPayloadPlugin } from '@xyo-network/address-payload-plugin'
import { XyoBlockchainPayloadPlugins } from '@xyo-network/blockchain-payload-plugins'
import { ConfigPayloadPlugin } from '@xyo-network/config-payload-plugin'
import { CryptoPayloadPlugins } from '@xyo-network/crypto-payload-plugins'
import { DomainPayloadPlugin } from '@xyo-network/domain-payload-plugin'
import { IdPayloadPlugin } from '@xyo-network/id-payload-plugin'
import { LocationCertaintyPayloadPlugin } from '@xyo-network/location-certainty-payload-plugin'
import { LocationPayloadPlugin } from '@xyo-network/location-payload-plugin'
import { ModuleInstancePayloadPlugin } from '@xyo-network/module-instance-payload-plugin'
import { PayloadPluginFunc } from '@xyo-network/payload-plugin'
import { QueryPayloadPlugin } from '@xyo-network/query-payload-plugin'
import { SchemaPayloadPlugin } from '@xyo-network/schema-payload-plugin'

export const PayloadPlugins: PayloadPluginFunc[] = [
  AddressPayloadPlugin,
  SchemaPayloadPlugin,
  LocationPayloadPlugin,
  LocationCertaintyPayloadPlugin,
  DomainPayloadPlugin,
  IdPayloadPlugin,
  ModuleInstancePayloadPlugin,
  ConfigPayloadPlugin,
  QueryPayloadPlugin,
  ...XyoBlockchainPayloadPlugins,
  ...CryptoPayloadPlugins,
]

// eslint-disable-next-line import/no-default-export
export default PayloadPlugins
