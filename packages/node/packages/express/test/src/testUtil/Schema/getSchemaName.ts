import { v4 } from 'uuid'

export const testSchemaPrefix = 'network.xyo.schema.test.'

export const getSchemaName = (): string => {
  return `${testSchemaPrefix}${v4()}`
}
