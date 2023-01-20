import { validate } from 'uuid'

import { getDateFromUuid } from './getDateFromUuid'

const oneHourInMs = 3600000

/**
 *
 * @param uuid UUIDv1 string
 * @returns true if the string was a valid UUIDv1 and generated today
 */
export const verifyUuid = (uuid: string): boolean => {
  try {
    if (validate(uuid)) {
      const uuidDate = getDateFromUuid(uuid)
      const now = new Date()
      const timeSinceIssuance = now.getTime() - uuidDate.getTime()
      return timeSinceIssuance < oneHourInMs
    }
  } catch (error) {
    return false
  }
  return false
}
