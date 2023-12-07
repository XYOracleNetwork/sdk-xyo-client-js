import { AnyObject } from '@xyo-network/object'

/** Object with a timestamp */
export interface Timestamp {
  timestamp: number
}

/** Add a timestamp field to any object */
export type WithTimestamp<T extends AnyObject = AnyObject> = T & Timestamp
