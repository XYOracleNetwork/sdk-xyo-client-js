export * from '@xyo-network/all-crypto-payload-plugins'
export * from '@xyo-network/bowser-system-info-payload-plugin'
export * from '@xyo-network/domain-payload-plugin'
export * from '@xyo-network/id-payload-plugin'
export * from '@xyo-network/location-payload-plugin'
export * from '@xyo-network/schema-payload-plugin'

import { XyoAllCryptoPayloadPlugins } from '@xyo-network/all-crypto-payload-plugins'
import { XyoBowserSystemInfoPayloadPlugin } from '@xyo-network/bowser-system-info-payload-plugin'
import { XyoDomainPayloadPlugin } from '@xyo-network/domain-payload-plugin'
import { XyoIdPayloadPlugin } from '@xyo-network/id-payload-plugin'
import { XyoLocationPayloadPlugin } from '@xyo-network/location-payload-plugin'
import { XyoSchemaPayloadPlugin } from '@xyo-network/schema-payload-plugin'

export const XyoAllPayloadPlugins = [
  ...XyoAllCryptoPayloadPlugins,
  XyoIdPayloadPlugin,
  XyoDomainPayloadPlugin,
  XyoLocationPayloadPlugin,
  XyoSchemaPayloadPlugin,
  XyoBowserSystemInfoPayloadPlugin,
]

// eslint-disable-next-line import/no-default-export
export default XyoAllPayloadPlugins
