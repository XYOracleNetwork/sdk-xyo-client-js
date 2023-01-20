export const getTimeFromUuid = (uuidV1: string) => {
  const parts = uuidV1.split('-')
  const time = [parts[2].substring(1), parts[1], parts[0]].join('')
  return parseInt(time, 16)
}
