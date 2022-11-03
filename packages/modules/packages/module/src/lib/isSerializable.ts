// Inspired by https://stackoverflow.com/a/49079549/2803259

import every from 'lodash/every'
import isArray from 'lodash/isArray'
import isBoolean from 'lodash/isBoolean'
import isNull from 'lodash/isNull'
import isNumber from 'lodash/isNumber'
import isPlainObject from 'lodash/isPlainObject'
import isString from 'lodash/isString'
import isUndefined from 'lodash/isUndefined'
import overSome from 'lodash/overSome'

export function isSerializable(obj: unknown): boolean {
  const nestedSerializable = (obj: unknown) => (isPlainObject(obj) || isArray(obj)) && every(obj as object, isSerializable)

  return overSome([isUndefined, isNull, isBoolean, isNumber, isString, nestedSerializable])(obj)
}
