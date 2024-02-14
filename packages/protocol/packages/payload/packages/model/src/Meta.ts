import { EmptyObject, JsonObject } from '@xylabs/object'

import { Payload, PayloadMetaFields } from './Payload'
import { Schema, WithSchema } from './Schema'

export type WithMeta<T extends Payload = Payload, M extends JsonObject | void = void> = T & PayloadMetaFields<M>
export type WithOptionalMeta<T extends Payload = Payload, M extends JsonObject | void = void> = Partial<WithMeta<T, M>> &
  Omit<WithMeta<T, M>, '$hash'>

export type PayloadWithMeta<T extends void | EmptyObject | WithSchema = void, S extends Schema | void = void> = WithMeta<Payload<T, S>>

export const unMeta = <T extends WithMeta<Payload>>(payload?: T): T | undefined => {
  if (payload) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { $meta, $hash, ...result } = payload
    return result as T
  }
}
