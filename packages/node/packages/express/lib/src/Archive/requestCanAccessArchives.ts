import { Request } from 'express'

import { requestCanAccessArchive } from './requestCanAccessArchive'

/**
 * Determines if the incoming request can access the supplied archives
 * @param req The incoming request
 * @param archives The name of the archives to test if the request can access
 * @returns True if the request can access the archives, false otherwise
 */
export const requestCanAccessArchives = async (req: Request, archives: string[]): Promise<boolean> => {
  const allAccessible = await Promise.all(archives.map((archive) => requestCanAccessArchive(req, archive)))
  const answer = allAccessible.every((accessible) => accessible)
  return answer
}
