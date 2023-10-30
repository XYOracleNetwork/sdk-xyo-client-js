import { exists } from '@xylabs/exists'
import { Promisable } from '@xylabs/promise'
import { AnyObject, ObjectWrapper } from '@xyo-network/object'
import { isEqual } from 'lodash'

import { PayloadHasher } from './PayloadHasher'

export interface PayloadHasherAnalyzeError extends Error {
  code:
    | 'INVALID_ROUNDTRIP'
    | 'INVALID_FIELD_NAME'
    | 'INVALID_SYNC_HASH'
    | 'INVALID_META_HASH'
    | 'INVALID_BYTE_LENGTH'
    | 'INVALID_LENGTH'
    | 'NOT_EQUAL'
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
    errors.push(
      ...(await this.analyzeSyncHash(obj)),
      ...(await this.analyzeWithMetaHash(obj)),
      ...(await this.analyzeRoundtrip(obj)),
      ...(await this.analyzeFieldNames(obj)),
    )
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
    /** @param path The path of the object if it is a field of another object */
    path?: string,
  ): Promise<Error[]> {
    const errors: Error[] = []
    const objAsyncHash = await PayloadHasher.hashAsync(obj)
    const enc = new TextEncoder()
    const stringified = PayloadHasher.stringifyHashFields(obj)
    const bytes = enc.encode(stringified)

    const roundTripped = JSON.parse(JSON.stringify(obj))
    const roundTrippedStringified = PayloadHasher.stringifyHashFields(roundTripped)
    const roundTrippedBytes = enc.encode(roundTrippedStringified)
    const roundTrippedHash = await PayloadHasher.hashAsync(roundTripped)

    if (bytes.length !== roundTrippedBytes.length) {
      const error: PayloadHasherAnalyzeError = {
        code: 'INVALID_LENGTH',
        field: 'root',
        message: `JSON roundtrip length mismatch [${bytes.byteLength}] [${roundTrippedBytes.byteLength}]`,
        name: 'PayloadHasherAnalyzeError',
      }
      errors.push(error)
    }

    if (bytes.byteLength !== roundTrippedBytes.byteLength) {
      const error: PayloadHasherAnalyzeError = {
        code: 'INVALID_BYTE_LENGTH',
        field: 'root',
        message: `JSON roundtrip bytelength mismatch [${bytes.byteLength}] [${roundTrippedBytes.byteLength}]`,
        name: 'PayloadHasherAnalyzeError',
      }
      errors.push(error)
    }

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
          return await this.analyzeRoundtripField(`${path ?? ''}/${field}`, value)
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

    if (typeof value === 'object') {
      if (value !== null) {
        if (Array.isArray(value)) {
          const errors = value.map(async (item, index) => await this.analyzeRoundtripField(`${field}/${index}`, item))
          if (errors.length > 0) {
            return errors[0]
          }
        } else {
          const errors = await this.analyzeRoundtrip(value, field)
          if (errors.length > 0) {
            return errors[0]
          }
        }
      }
    }

    if (!isEqual(fieldOnlyObject, roundTripped)) {
      const error: PayloadHasherAnalyzeError = {
        code: 'NOT_EQUAL',
        field,
        message: `JSON roundtrip isEqual failed [${field}]`,
        name: 'PayloadHasherAnalyzeError',
      }
      return error
    }

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

  /** @function analyzeSyncHash Verify that the hash of the object is equal even if hashing sync (shajs) vs async (wasm) */
  static async analyzeSyncHash<T extends AnyObject>(
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
        message: `async/sync hash failed [${objAsyncHash}] [${objSyncHash}]`,
        name: 'PayloadHasherAnalyzeError',
      }
      errors.push(error)
    }
    return errors
  }

  /** @function analyzeWithMetaHash Verify that the hash of the object is equal even if meta fields set */
  static async analyzeWithMetaHash<T extends AnyObject>(
    /** @param obj The object being analyzed */
    obj: T,
  ): Promise<Error[]> {
    const errors: Error[] = []
    const objAsyncHash = await PayloadHasher.hashAsync(obj)
    const objWithMeta = { ...obj, _hash: objAsyncHash, _timestamp: Date.now() }
    const objWithMetaHash = PayloadHasher.hashSync(objWithMeta)
    if (objAsyncHash !== objWithMetaHash) {
      const error: PayloadHasherAnalyzeError = {
        code: 'INVALID_META_HASH',
        field: 'root',
        message: `adding meta hash failed [${objAsyncHash}] [${objWithMetaHash}]`,
        name: 'PayloadHasherAnalyzeError',
      }
      errors.push(error)
    }
    return errors
  }
}
