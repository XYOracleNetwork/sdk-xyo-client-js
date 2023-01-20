import { Request } from 'express'

export const verifyArchiveOwner = async (req: Request): Promise<boolean> => {
  // Validate user from request
  const { user } = req
  if (!user || !user.id) {
    return false
  }
  // Validate archive from request
  const { archive } = req.params
  if (!archive) {
    return false
  }
  const existingArchives = await req.app.archiveArchivist.get([archive])
  const existingArchive = existingArchives.pop()
  // Validate user is archive owner
  return !!existingArchive && existingArchive.user === user.id
}
