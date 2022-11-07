import { XyoArchiveKey } from '@xyo-network/api'
import { v4 } from 'uuid'

export const generateArchiveKey = (archive: string): XyoArchiveKey => {
  const key = v4()
  return { archive, key }
}
