import { XyoModuleDiscoverQueryPayload, XyoModuleDiscoverQueryPayloadSchema } from './Discover'
import { XyoModuleSubscribeQueryPayload, XyoModuleSubscribeQueryPayloadSchema } from './Subscribe'

export * from './Discover'
export * from './Query'
export * from './Subscribe'

export type XyoModuleQueryPayloadSchema = XyoModuleSubscribeQueryPayloadSchema | XyoModuleDiscoverQueryPayloadSchema

export type XyoModuleQueryPayload = XyoModuleSubscribeQueryPayload | XyoModuleDiscoverQueryPayload
