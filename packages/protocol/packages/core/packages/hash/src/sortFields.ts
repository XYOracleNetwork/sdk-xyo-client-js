import { AnyObject, EmptyObject, isObject } from '@xyo-network/object'

//if an object, sub-sort
const subSort = (value: unknown) => {
  return isObject(value) ? sortFields(value) : value
}

export const sortFields = <T extends EmptyObject>(obj: T) => {
  const result: AnyObject = {}
  const keys = Object.keys(obj) as (keyof T)[]
  keys.sort().forEach((key: keyof T) => {
    result[key] = subSort(obj[key])
  })
  return result as T
}
