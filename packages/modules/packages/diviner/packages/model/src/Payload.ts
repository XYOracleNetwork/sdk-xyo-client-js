import { Hash } from '@xylabs/hex'
import { EmptyObject, WithAdditional } from '@xylabs/object'
import { Payload, Schema, WithSchema } from '@xyo-network/payload-model'

export type DivinedPayload<T extends void | EmptyObject | WithSchema = void, S extends Schema | void = void> = Payload<
  WithAdditional<{ sources: Hash[] }, T>,
  S
>
