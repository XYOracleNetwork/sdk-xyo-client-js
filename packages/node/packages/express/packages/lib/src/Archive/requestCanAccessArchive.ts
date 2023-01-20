import { ArchiveArchivist } from '@xyo-network/node-core-model'
import { Request } from 'express'

import { isRequestUserOwnerOfArchive } from './isArchiveOwner'
import { isLegacyPublicArchive } from './legacyArchiveAccessControl'

/**
 * Determines if the incoming request can access the supplied archive
 * @param req The incoming request
 * @param name The name of the archive to test if the request can access
 * @returns True if the request can access the archive, false otherwise
 */
export const requestCanAccessArchive = async (req: Request, name: string): Promise<boolean> => {
  const { archiveArchivist } = req.app as unknown as { archiveArchivist: ArchiveArchivist }
  const archives = await archiveArchivist.get([name])
  const archive = archives.pop()
  // If the archive is public or if the archive is private but this is
  // an auth'd request from the archive owner
  return isLegacyPublicArchive(archive) || isRequestUserOwnerOfArchive(req, archive)
}
