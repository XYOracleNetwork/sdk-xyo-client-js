import { getTimeFromUuid } from './getTimeFromUuid'

const gregorianOffset = 122192928000000000
export const getDateFromUuid = (uuidV1: string) => {
  const time = getTimeFromUuid(uuidV1) - gregorianOffset
  const milliseconds = Math.floor(time / 10000)
  return new Date(milliseconds)
}
