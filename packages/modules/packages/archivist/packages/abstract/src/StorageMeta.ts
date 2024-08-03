import { assertEx } from '@xylabs/assert'
import { Payload, PayloadWithMeta, WithMeta } from '@xyo-network/payload-model'

export interface StorageMeta {
  _sequence: bigint
}

export type WithOptionalStorageMeta<T extends Payload> = T & Partial<StorageMeta>

export type WithStorageMeta<T extends Payload> = T & StorageMeta

export const maxSequenceIndex = 10_000_000_000n

export const sequenceNumber = (index: number) => {
  assertEx(index < maxSequenceIndex, () => `index may not be larger than ${maxSequenceIndex}`)
  return BigInt(Date.now()) * maxSequenceIndex + BigInt(index)
}

export const addStorageMeta = <T extends PayloadWithMeta>(payload: T, index = 0) => {
  return { ...payload, _sequence: sequenceNumber(index) }
}

export const sortByStorageMeta = <T extends PayloadWithMeta>(payloads: WithStorageMeta<T>[], direction: -1 | 1 = 1) => {
  return payloads.sort((a, b) =>
    a._sequence < b._sequence
      ? -direction
      : a._sequence > b._sequence
        ? direction
        : 0,
  )
}

export function removeStorageMeta<T extends Payload>(payload: WithOptionalStorageMeta<WithMeta<T>>): WithMeta<T>
export function removeStorageMeta<T extends Payload>(payloads: WithOptionalStorageMeta<WithMeta<T>>[]): WithMeta<T>[]
export function removeStorageMeta<T extends Payload>(payload?: WithOptionalStorageMeta<WithMeta<T>>): WithMeta<T> | undefined
export function removeStorageMeta<T extends Payload>(payload?: WithOptionalStorageMeta<WithMeta<T>>) {
  if (!payload) return
  if (Array.isArray(payload)) {
    return payload.map(p => removeStorageMeta(p))
  }

  const { ...noMeta } = payload
  delete noMeta._sequence
  return noMeta
}
