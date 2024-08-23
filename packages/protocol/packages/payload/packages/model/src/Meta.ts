import type { EmptyObject, JsonObject } from '@xylabs/object'

import type { Payload, PayloadMetaFields } from './Payload.ts'
import type { Schema, WithSchema } from './Schema.ts'

export type WithMeta<T extends Payload = Payload, M extends JsonObject | void = void> = PayloadMetaFields<M> & T
export type WithOptionalMeta<T extends Payload = Payload, M extends JsonObject | void = void> = Partial<WithMeta<T, M>> &
  Omit<WithMeta<T, M>, '$hash'>

export type PayloadWithMeta<T extends void | EmptyObject | WithSchema = void, S extends Schema | void = void> = WithMeta<Payload<T, S>>

export const unMeta = <T extends WithMeta<Payload>>(payload?: T): T | undefined => {
  if (payload) {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      $meta, $hash, ...result
    } = payload
    return result as T
  }
}
