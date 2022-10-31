export * from '@xyo-network/blockchain-payload-plugins'
export * from '@xyo-network/crypto-payload-plugins'
export * from '@xyo-network/domain-payload-plugin'
export * from '@xyo-network/elevation-payload-plugin'
export * from '@xyo-network/id-payload-plugin'
export * from '@xyo-network/location-certainty-payload-plugin'
export * from '@xyo-network/location-payload-plugin'
export * from '@xyo-network/module-instance-payload-plugin'
export * from '@xyo-network/schema-payload-plugin'
export * from '@xyo-network/system-payload-plugins'

import { XyoBlockchainPayloadPlugins } from '@xyo-network/blockchain-payload-plugins'
import { XyoCryptoPayloadPlugins } from '@xyo-network/crypto-payload-plugins'
import { XyoDomainPayloadPlugin } from '@xyo-network/domain-payload-plugin'
import { XyoLocationElevationPayloadPlugin } from '@xyo-network/elevation-payload-plugin'
import { XyoIdPayloadPlugin } from '@xyo-network/id-payload-plugin'
import { LocationCertaintyPayloadPlugin } from '@xyo-network/location-certainty-payload-plugin'
import { XyoLocationPayloadPlugin } from '@xyo-network/location-payload-plugin'
import { XyoModuleInstancePayloadPlugin } from '@xyo-network/module-instance-payload-plugin'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoSchemaPayloadPlugin } from '@xyo-network/schema-payload-plugin'
import { XyoSystemPayloadPlugins } from '@xyo-network/system-payload-plugins'

export const XyoPayloadPlugins: XyoPayloadPluginFunc[] = [
  ...XyoSystemPayloadPlugins,
  ...XyoBlockchainPayloadPlugins,
  ...XyoCryptoPayloadPlugins,
  XyoDomainPayloadPlugin,
  XyoLocationElevationPayloadPlugin,
  XyoIdPayloadPlugin,
  XyoLocationPayloadPlugin,
  XyoModuleInstancePayloadPlugin,
  XyoSchemaPayloadPlugin,
  LocationCertaintyPayloadPlugin,
]

// eslint-disable-next-line import/no-default-export
export default XyoPayloadPlugins
