import { asSchema } from '@xyo-network/payload-model'
import { v4 as uuid } from 'uuid'

export const testSchemaPrefix = 'network.xyo.test.'

export const getTestSchemaName = () => {
  return asSchema(`${testSchemaPrefix}${uuid()}`, true)
}
