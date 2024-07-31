import { v4 as uuid } from 'uuid'

export const testSchemaPrefix = 'network.xyo.test.'

export const getTestSchemaName = (): string => {
  return `${testSchemaPrefix}${uuid()}`
}
