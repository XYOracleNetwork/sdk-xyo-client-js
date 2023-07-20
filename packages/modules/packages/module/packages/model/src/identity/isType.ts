/* eslint-disable @typescript-eslint/no-explicit-any */
import { Payload } from '@xyo-network/payload-model'

export type FieldType = 'string' | 'number' | 'object' | 'symbol' | 'symbol' | 'undefined' | 'null' | 'array' | 'function' | 'payload'

export type ObjectTypeShape = Record<string | number | symbol, FieldType>

export const isType = (value: unknown, expectedType: FieldType) => {
  if (expectedType === 'array') {
    return Array.isArray(value)
  } else if (expectedType === 'payload') {
    const payload = value as Payload
    return typeof value === 'object' && typeof payload.schema === 'string'
  } else {
    return typeof value === expectedType
  }
}
