export const getArchive = (): string => {
  return process.env.ARCHIVIST_ARCHIVE || 'temp'
}
