import type { AnyObject, EmptyObject } from '@xylabs/object'
import { isObject } from '@xylabs/object'

// if an object, sub-sort
const subSort = (value: unknown) => {
  return isObject(value) ? sortFields(value) : value
}

export const sortFields = <T extends EmptyObject>(obj: T) => {
  const result: AnyObject = {}
  const keys = Object.keys(obj) as (keyof T)[]
  // eslint-disable-next-line sonarjs/no-alphabetical-sort
  for (const key of keys.toSorted()) {
    result[key] = subSort(obj[key])
  }
  return result as T
}
