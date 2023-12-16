/* eslint-disable @typescript-eslint/no-explicit-any */

/** @deprecated use from @xyo-network/object instead */
export type FieldType = 'string' | 'number' | 'object' | 'symbol' | 'symbol' | 'undefined' | 'null' | 'array' | 'function'

/** @deprecated use from @xyo-network/object instead */
export type ObjectTypeShape = Record<string | number | symbol, FieldType>

/** @deprecated use from @xyo-network/object instead */
export const isType = (value: unknown, expectedType: FieldType) => {
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
    default: {
      return typeof value === expectedType
    }
  }
}
