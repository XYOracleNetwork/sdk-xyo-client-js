import { Payload } from '@xyo-network/payload-model'
import { JsonValue } from '@xyo-network/value-payload-plugin'

export type PayloadValueTransformer<TSource extends Payload = Payload> = (payload: TSource) => JsonValue

export type PayloadTransformer<TSource extends Payload = Payload, TDestination extends Payload = Payload> = (payload: TSource) => TDestination
