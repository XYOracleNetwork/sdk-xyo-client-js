import { typeOf } from '../../lib'

//if an object, subsort
const subSort = (value: unknown) => {
  switch (typeOf(value)) {
    case 'object':
      return sortFields(value as Record<string, unknown>)
    default:
      return value
  }
}

export const sortFields = <T extends Record<string, unknown>>(obj: T) => {
  if (obj === null) {
    return null
  }
  const result: Record<string, unknown> = {} as Record<string, unknown>
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      result[key] = subSort(obj[key])
    })
  return result as T
}
