import { exists } from '@xylabs/exists'

import { normalizeAddress } from './normalize'

export const concat = (a?: string | string[], b?: string | string[]): string[] => {
  return ([] as (string | undefined)[]).concat(a).concat(b).filter(exists).map(normalizeAddress)
}
