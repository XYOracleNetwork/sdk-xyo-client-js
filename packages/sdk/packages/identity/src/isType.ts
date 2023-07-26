/* eslint-disable @typescript-eslint/no-explicit-any */

export type FieldType = 'string' | 'number' | 'object' | 'symbol' | 'symbol' | 'undefined' | 'null' | 'array' | 'function'

export type ObjectTypeShape = Record<string | number | symbol, FieldType>

export const isType = (value: unknown, expectedType: FieldType) => {
  switch (expectedType) {
    case 'array':
      return Array.isArray(value)
    case 'null':
      return value === null
    case 'undefined':
      return value === undefined
    default:
      return typeof value === expectedType
  }
}
