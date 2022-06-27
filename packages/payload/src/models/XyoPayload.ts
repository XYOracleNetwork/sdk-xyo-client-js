import { XyoPayloadBase } from './Base'

export type XyoPayload<T extends object = object> = T & XyoPayloadBase
