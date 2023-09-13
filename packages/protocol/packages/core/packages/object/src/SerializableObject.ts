import { AnyObject } from './AnyObject'

export type SerializableTypes = object | number | string | boolean | undefined | null | []

export type JSONObject = {
  [key: string]: JSONValue
}
export type JSONValue = null | boolean | number | string | JSONValue[] | JSONObject

export type Serializable<T extends AnyObject | void = void> = T extends JSONObject ? T : JSONObject
