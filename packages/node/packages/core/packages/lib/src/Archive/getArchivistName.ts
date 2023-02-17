export const archivePermissionsArchivistType = 'permissions'
export const boundWitnessArchivistType = 'boundwitness'
export const payloadArchivistType = 'payload'

export const archivistRegex = /(?<archive>.*)\[(?<type>payload|boundwitness)\]/

export interface ArchivistRegexMatch {
  archive: string
  type: string
}

export type ArchivistRegexResult = ArchivistRegexMatch | undefined

export const getBoundWitnessArchivistName = (name: string) => {
  return `${name.toLowerCase()}[${boundWitnessArchivistType}]`
}

export const getPayloadArchivistName = (name: string) => {
  return `${name.toLowerCase()}[${payloadArchivistType}]`
}

export const getArchivePermissionsArchivistName = (name: string) => {
  return `${name.toLowerCase()}[${archivePermissionsArchivistType}]`
}
