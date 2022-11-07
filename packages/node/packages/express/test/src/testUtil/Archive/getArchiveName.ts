import { v4 } from 'uuid'

export const testArchivePrefix = 'test-'

export const getArchiveName = (): string => {
  return `${testArchivePrefix}${v4()}`
}
