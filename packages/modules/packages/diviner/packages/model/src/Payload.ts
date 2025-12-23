import type {
  EmptyObject, Hash, WithAdditional,
} from '@xylabs/sdk-js'
import type {
  Payload, Schema, WithSchema,
} from '@xyo-network/payload-model'

export type DivinedPayload<T extends void | EmptyObject | WithSchema = void, S extends Schema | void = void> = Payload<
  WithAdditional<{ sources: Hash[] }, T>,
  S
>
