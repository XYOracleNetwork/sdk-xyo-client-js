import { assertEx } from '@xylabs/assert'
import { Payload, PayloadWithMeta } from '@xyo-network/payload-model'

export type WithStorageMeta<T extends Payload> = T & {
  _sequence: bigint
}

export const maxSequenceIndex = 10_000_000_000n

export const sequenceNumber = (index: number) => {
  assertEx(index < maxSequenceIndex, () => `index may not be larger than ${maxSequenceIndex}`)
  return BigInt(Date.now()) * maxSequenceIndex + BigInt(index)
}

export const addStorageMeta = <T extends PayloadWithMeta>(payload: T, index = 0) => {
  return { ...payload, _sequence: sequenceNumber(index) } as WithStorageMeta<T>
}

export const sortByStorageMeta = <T extends PayloadWithMeta>(payloads: WithStorageMeta<T>[]) => {
  return payloads.sort((a, b) =>
    a._sequence < b._sequence ? -1
    : a._sequence > b._sequence ? 1
    : 0,
  )
}

export function removeStorageMeta<T extends PayloadWithMeta>(payload: WithStorageMeta<T>): T
export function removeStorageMeta<T extends PayloadWithMeta>(payload?: WithStorageMeta<T>): T | undefined
export function removeStorageMeta<T extends PayloadWithMeta>(payload?: WithStorageMeta<T>) {
  if (!payload) return
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _sequence, ...noMeta } = payload as WithStorageMeta<T>
  return noMeta as T
}
