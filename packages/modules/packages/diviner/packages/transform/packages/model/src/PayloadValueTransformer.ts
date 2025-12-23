import type { JsonValue } from '@xylabs/sdk-js'
import type { Payload } from '@xyo-network/payload-model'

export type PayloadValueTransformer<TSource extends Payload = Payload> = (payload: TSource) => JsonValue

export type PayloadTransformer<TSource extends Payload = Payload, TDestination extends Payload = Payload> = (payload: TSource) => TDestination
