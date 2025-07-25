import { AsObjectFactory, isObject } from '@xylabs/object'

import type { Payload } from './Payload.ts'

export const isAnyPayload = (value: unknown): value is Payload => {
  if (isObject(value)) {
    return typeof (value as Payload).schema === 'string'
  }
  return false
}

export const asAnyPayload = AsObjectFactory.create(isAnyPayload)

export const isPayload
  = <T extends Payload>(schema: string[]) =>
    (value: unknown): value is T => {
      if (isAnyPayload(value)) {
        return schema.includes(value.schema)
      }
      return false
    }

export const asPayload = <T extends Payload>(schema: string[]) => AsObjectFactory.create((value: unknown): value is T => isPayload(schema)(value))
