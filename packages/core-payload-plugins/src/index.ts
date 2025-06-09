export * from '@xyo-network/address-payload-plugin'
export * from '@xyo-network/config-payload-plugin'
export * from '@xyo-network/domain-payload-plugin'
export * from '@xyo-network/id-payload-plugin'
export * from '@xyo-network/query-payload-plugin'
export * from '@xyo-network/schema-payload-plugin'
export * from '@xyo-network/value-payload-plugin'

import { AddressPayloadPlugin } from '@xyo-network/address-payload-plugin'
import { ConfigPayloadPlugin } from '@xyo-network/config-payload-plugin'
import { DomainPayloadPlugin } from '@xyo-network/domain-payload-plugin'
import { IdPayloadPlugin } from '@xyo-network/id-payload-plugin'
import type { Payload } from '@xyo-network/payload-model'
import type { PayloadPluginFunc } from '@xyo-network/payload-plugin'
import { QueryPayloadPlugin } from '@xyo-network/query-payload-plugin'
import { SchemaPayloadPlugin } from '@xyo-network/schema-payload-plugin'

export const PayloadPlugins: PayloadPluginFunc<Payload>[] = [
  AddressPayloadPlugin,
  SchemaPayloadPlugin,
  DomainPayloadPlugin,
  IdPayloadPlugin,
  ConfigPayloadPlugin,
  QueryPayloadPlugin,
]

export default PayloadPlugins
