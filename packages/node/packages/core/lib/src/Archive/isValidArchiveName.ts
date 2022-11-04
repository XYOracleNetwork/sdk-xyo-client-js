const pattern = /^[a-z0-9-]+$/

export const isValidArchiveName = (archive?: string) => {
  return archive ? pattern.test(archive) : false
}
