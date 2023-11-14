/* eslint-disable import/no-deprecated */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Logger } from '@xylabs/logger'

import { isType, ObjectTypeShape } from './isType'

/** @deprecated use from @xyo-network/object instead */
export interface ObjectTypeConfig {
  log?: boolean | Logger
}

/** @deprecated use from @xyo-network/object instead */
export type ObjectTypeCheck<T extends {} = {}> = (obj: any, config?: ObjectTypeConfig) => obj is T

/** @deprecated use from @xyo-network/object instead */
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
