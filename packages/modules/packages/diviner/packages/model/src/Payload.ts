import type { Hash } from '@xylabs/hex'
import type { EmptyObject, WithAdditional } from '@xylabs/object'
import type { Payload, Schema, WithSchema } from '@xyo-network/payload-model'

export type DivinedPayload<T extends void | EmptyObject | WithSchema = void, S extends Schema | void = void> = Payload<
  WithAdditional<{ sources: Hash[] }, T>,
  S
>
