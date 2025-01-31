export * from '@xyo-network/address-payload-plugin'
export * from '@xyo-network/config-payload-plugin'
export * from '@xyo-network/domain-payload-plugin'
export * from '@xyo-network/id-payload-plugin'
export * from '@xyo-network/query-payload-plugin'
export * from '@xyo-network/schema-payload-plugin'
export * from '@xyo-network/value-payload-plugin'

import type { JsonObject } from '@xylabs/object'
import { AddressPayloadPlugin } from '@xyo-network/address-payload-plugin'
import { ConfigPayloadPlugin } from '@xyo-network/config-payload-plugin'
import { DomainPayloadPlugin } from '@xyo-network/domain-payload-plugin'
import { IdPayloadPlugin } from '@xyo-network/id-payload-plugin'
import type { PayloadPluginFunc } from '@xyo-network/payload-plugin'
import { QueryPayloadPlugin } from '@xyo-network/query-payload-plugin'
import { SchemaPayloadPlugin } from '@xyo-network/schema-payload-plugin'

import type { Schema } from '../../protocol/dist/neutral/index.js'

export const PayloadPlugins: PayloadPluginFunc<JsonObject, Schema>[] = [
  AddressPayloadPlugin,
  SchemaPayloadPlugin,
  DomainPayloadPlugin,
  IdPayloadPlugin,
  ConfigPayloadPlugin,
  QueryPayloadPlugin,
]

export default PayloadPlugins
