import { XyoPayload } from '@xyo-network/payload'
import { OptionalId, WithId, WithoutId } from 'mongodb'

export const removeId = <T extends XyoPayload = XyoPayload>(payload: T | WithId<T> | WithoutId<T> | OptionalId<T>): WithoutId<T> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...withoutId } = payload as OptionalId<T>
  return withoutId as WithoutId<T>
}
