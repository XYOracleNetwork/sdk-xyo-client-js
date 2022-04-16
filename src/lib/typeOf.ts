export type TypeOfTypes = 'string' | 'number' | 'object' | 'array' | 'buffer' | 'null' | 'undefined' | 'bigint' | 'boolean' | 'function' | 'symbol'

export const typeOf = <T>(item: T): TypeOfTypes => {
  return Array.isArray(item) ? 'array' : typeof item
}

export const ifTypeOf = <T, R>(typeName: TypeOfTypes, value: unknown, trueFunc: (value: T) => R, isFunc?: (value: T) => boolean) => {
  switch (typeOf(value)) {
    case typeName:
      return !isFunc || isFunc(value as T) ? trueFunc(value as T) : undefined
  }
}

export const ifDefined = <T>(value: T, func: (value: T) => void) => {
  switch (typeOf(value)) {
    case 'undefined':
    case 'null':
      break
    default:
      func(value)
      return value
  }
}

export const validateType = <T>(typeName: TypeOfTypes, value: T, optional = false): [T | undefined, Error[]] => {
  switch (typeOf(value)) {
    case typeName:
      return [value, []]
    default: {
      if (optional && typeOf(value) === 'undefined') {
        return [value, []]
      }
      return [undefined, [Error(`value type is not '${typeName}:${typeof value}'`)]]
    }
  }
}
