import { Logger } from '@xylabs/logger'

import { isType, ObjectTypeShape } from './isType'

export interface ObjectTypeConfig {
  log?: boolean | Logger
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
export type ObjectTypeCheck<T extends {} = {}> = (obj: any, config?: ObjectTypeConfig) => obj is T

// eslint-disable-next-line @typescript-eslint/ban-types
export class IsObjectFactory<T extends {}> {
  create(shape?: ObjectTypeShape, additionalChecks?: ObjectTypeCheck[]): ObjectTypeCheck<T> {
    return (obj, { log } = {}): obj is T => {
      if (!obj || typeof obj !== 'object') {
        return false
      }
      return (
        //do primary check
        Object.entries(shape ?? {}).reduce((prev, [key, type]) => {
          const result = isType(obj[key], type)
          if (!result && log) {
            const logger = typeof log === 'object' ? log : console
            logger.warn(`isType Failed: ${key}: ${type}`)
          }
          return prev && result
        }, true) &&
        //perform additional checks
        (additionalChecks?.reduce((prev, check) => prev && check(obj, { log }), true) ?? true)
      )
    }
  }
}
