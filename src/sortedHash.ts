import shajs from 'sha.js'

import sortedStringify from './sortedStringify'

const sortedHash = <T extends Record<string, unknown>>(obj: T) => {
  const stringObject = sortedStringify<T>(obj)
  return shajs('sha256').update(stringObject).digest('hex')
}

export default sortedHash
