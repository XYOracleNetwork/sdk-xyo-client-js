/* eslint-disable @typescript-eslint/no-explicit-any */

export type FieldType = 'string' | 'number' | 'object' | 'symbol' | 'symbol' | 'undefined' | 'null' | 'array' | 'function'

export type ObjectTypeShape = Record<string | number | symbol, FieldType>

export const isType = (value: unknown, expectedType: FieldType) => {
  const typeofValue = typeof value
  switch (expectedType) {
    case 'array': {
      return Array.isArray(value)
    }
    case 'null': {
      return value === null
    }
    case 'undefined': {
      return value === undefined
    }
    case 'object': {
      //nulls resolve to objects, so exclude them
      if (value === null) {
        return false
      }
      //arrays resolve to objects, so exclude them
      return typeofValue === 'object' && !Array.isArray(value)
    }
    default: {
      return typeofValue === expectedType
    }
  }
}
