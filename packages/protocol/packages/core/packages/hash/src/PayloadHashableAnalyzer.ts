import { exists } from '@xylabs/exists'
import { Promisable } from '@xylabs/promise'
import { AnyObject, ObjectWrapper } from '@xyo-network/object'

import { PayloadHasher } from './PayloadHasher'

export interface PayloadHasherAnalyzeError extends Error {
  code: 'INVALID_ROUNDTRIP' | 'INVALID_FIELD_NAME' | 'INVALID_SYNC_HASH'
  field: string
}

/** @class Verify that the object is hashable */
export class PayloadHashableAnalyzer<T extends AnyObject = AnyObject> extends ObjectWrapper<T> {
  /** @function analyze Verify that the object is hashable */
  static async analyze<T extends AnyObject>(
    /** @param obj The object being analyzed */
    obj: T,
  ): Promise<Error[]> {
    const errors: Error[] = []
    errors.push(...(await this.analyzeRoundtrip(obj)), ...(await this.analyzeFieldNames(obj)))
    return errors
  }

  /** @function analyzeFieldNames Verify that the field names of the object are strings */
  static analyzeFieldNames<T extends AnyObject>(
    /** @param obj The object being analyzed */
    obj: T,
  ): Promisable<Error[]> {
    const errors: Error[] = []
    const roundTripErrors = Object.entries(obj)
      .map(([field]) => {
        const detectedType = typeof field
        if (detectedType !== 'string') {
          const error: PayloadHasherAnalyzeError = {
            code: 'INVALID_FIELD_NAME',
            field,
            message: `Field name was not of type 'string' [${detectedType}]`,
            name: 'PayloadHasherAnalyzeError',
          }
          return error
        }
      })
      .filter(exists)
    errors.push(...roundTripErrors)
    return errors
  }

  /** @function analyzeRoundtrip Verify that the hash of the object is equal even if round tripped through JSON.stringify */
  static async analyzeRoundtrip<T extends AnyObject>(
    /** @param obj The object being analyzed */
    obj: T,
  ): Promise<Error[]> {
    const errors: Error[] = []
    const objAsyncHash = await PayloadHasher.hashAsync(obj)
    const objSyncHash = PayloadHasher.hashSync(obj)
    if (objAsyncHash !== objSyncHash) {
      const error: PayloadHasherAnalyzeError = {
        code: 'INVALID_SYNC_HASH',
        field: 'root',
        message: `JSON async/sync hash failed [${objAsyncHash}] [${objSyncHash}]`,
        name: 'PayloadHasherAnalyzeError',
      }
      errors.push(error)
    }

    const roundTripped = JSON.parse(JSON.stringify(obj))
    const roundTrippedHash = await PayloadHasher.hashAsync(roundTripped)
    if (objAsyncHash !== roundTrippedHash) {
      const error: PayloadHasherAnalyzeError = {
        code: 'INVALID_ROUNDTRIP',
        field: 'root',
        message: `JSON roundtrip failed [${objAsyncHash}] [${roundTrippedHash}]`,
        name: 'PayloadHasherAnalyzeError',
      }
      errors.push(error)
    }
    const fieldRoundtripErrors = (
      await Promise.all(
        Object.entries(obj).map(async ([field, value]) => {
          return await this.analyzeRoundtripField(field, value)
        }),
      )
    ).filter(exists)
    errors.push(...fieldRoundtripErrors)
    return errors
  }

  /** @function analyzeRoundtripField Verify that the hash of a field is equal even if round tripped through JSON.stringify */
  static async analyzeRoundtripField<T>(
    /** @param field The name of the field being analyzed (used for error generation) */
    field: string,
    /** @param value The value of the field being analyzed */
    value: T,
  ): Promise<Error | undefined> {
    const fieldOnlyObject = {
      [field]: value,
    }
    const fieldOnlyObjectHash = await PayloadHasher.hashAsync(fieldOnlyObject)
    const roundTripped = JSON.parse(JSON.stringify(fieldOnlyObject))
    const roundTrippedHash = await PayloadHasher.hashAsync(roundTripped)
    if (fieldOnlyObjectHash !== roundTrippedHash) {
      const error: PayloadHasherAnalyzeError = {
        code: 'INVALID_ROUNDTRIP',
        field,
        message: `JSON roundtrip failed [${fieldOnlyObjectHash}] [${roundTrippedHash}]`,
        name: 'PayloadHasherAnalyzeError',
      }
      return error
    }
  }
}
