import type { EmptyObject } from '@xylabs/object'

/** Object with a timestamp */
export interface Timestamp {
  timestamp: number
}

/** Add a timestamp field to any object */
export type WithTimestamp<T extends EmptyObject = EmptyObject> = T & Timestamp
