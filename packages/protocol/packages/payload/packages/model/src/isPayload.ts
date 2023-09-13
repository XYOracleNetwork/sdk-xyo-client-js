/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsObjectFactory, isObject } from '@xyo-network/object'

import { Payload } from './Payload'

export const isAnyPayload = (obj: any): obj is Payload => {
  if (isObject(obj)) {
    return typeof obj.schema === 'string'
  }
  return false
}

export const isPayload =
  <T extends Payload>(schema: string[]) =>
  (obj: any): obj is T => {
    if (isAnyPayload(obj)) {
      return schema.includes(obj.schema)
    }
    return false
  }

export const asPayload = <T extends Payload>(schema: string[]) => AsObjectFactory.create((obj: any): obj is T => isPayload(schema)(obj))
