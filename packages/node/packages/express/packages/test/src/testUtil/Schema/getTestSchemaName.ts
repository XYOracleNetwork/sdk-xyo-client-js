import { uuid } from '@xyo-network/core'

export const testSchemaPrefix = 'network.xyo.test.'

export const getTestSchemaName = (): string => {
  return `${testSchemaPrefix}${uuid()}`
}
