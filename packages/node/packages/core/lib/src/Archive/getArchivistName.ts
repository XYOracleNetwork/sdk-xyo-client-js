export const boundWitnessArchivistType = 'boundwitness'
export const payloadArchivistType = 'payload'

export const getBoundWitnessArchivistName = (name: string) => {
  return `${name.toLowerCase()}[${boundWitnessArchivistType}]`
}

export const getPayloadArchivistName = (name: string) => {
  return `${name.toLowerCase()}[${payloadArchivistType}]`
}
