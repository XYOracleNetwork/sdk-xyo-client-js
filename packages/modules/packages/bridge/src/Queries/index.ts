import { XyoModuleQuery, XyoModuleQuerySchema, XyoQuery } from '@xyo-network/module'

import { XyoBridgeConnectQuery, XyoBridgeConnectQuerySchema } from './Connect'
import { XyoBridgeDisconnectQuery, XyoBridgeDisconnectQuerySchema } from './Disconnect'

export * from './Connect'
export * from './Disconnect'

type XyoBridgeQueryBase = XyoBridgeConnectQuery | XyoBridgeDisconnectQuery | XyoModuleQuery
export type XyoBridgeQuery<T extends XyoQuery = XyoQuery> = T extends XyoQuery ? XyoBridgeQueryBase | T : XyoBridgeQueryBase

type XyoBridgeQuerySchemaBase = XyoBridgeConnectQuerySchema | XyoBridgeDisconnectQuerySchema | XyoModuleQuerySchema
export type XyoBridgeQuerySchema<T extends string = string> = T extends string ? XyoBridgeQuerySchemaBase | T : XyoBridgeQuerySchemaBase
