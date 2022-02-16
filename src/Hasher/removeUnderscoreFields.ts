import assign from 'lodash/assign'
import isObject from 'lodash/isObject'
import mapValues from 'lodash/mapValues'
import omitBy from 'lodash/omitBy'
import pickBy from 'lodash/pickBy'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasLeadingUnderscore = (_: any, key: any) => key.startsWith('_')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeUnderscoreFields = <T>(obj: T) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onlyObjects = pickBy<T>(obj as any, isObject)
  const processedObjects = mapValues<T>(onlyObjects, removeUnderscoreFields)
  const addBackValues = assign(processedObjects, omitBy(obj, isObject))
  const ommited = omitBy(addBackValues, hasLeadingUnderscore)
  return ommited
}
