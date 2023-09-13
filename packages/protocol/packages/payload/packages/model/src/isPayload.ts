/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsObjectFactory } from '@xyo-network/object-identity'

import { Payload } from './Payload'

export const isObject = (x: any): x is Record<string | symbol | number, any> => {
  return typeof x === 'object' && !Array.isArray(x)
}

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
