export * from '@xyo-network/domain-payload-plugin'
export * from '@xyo-network/location-payload-plugin'
export * from '@xyo-network/pentair-payload-plugin'

import { DomainPayloadPlugin } from '@xyo-network/domain-payload-plugin'
import { LocationPayloadPlugin } from '@xyo-network/location-payload-plugin'
import { XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoPentairScreenlogicPayloadPlugin } from '@xyo-network/pentair-payload-plugin'

export const PayloadPlugins: XyoPayloadPluginFunc[] = [XyoPentairScreenlogicPayloadPlugin, LocationPayloadPlugin, DomainPayloadPlugin]

// eslint-disable-next-line import/no-default-export
export default PayloadPlugins
