/* eslint-disable @typescript-eslint/no-explicit-any */
import { Payload } from './Payload'

export const isObject = (x: any): x is Record<string | symbol | number, any> => {
  return typeof x === 'object' && !Array.isArray(x)
}

export const isPayload = (x: any): x is Payload => {
  if (isObject(x)) {
    return !!x && typeof x['schema'] === 'string'
  }
  return false
}
