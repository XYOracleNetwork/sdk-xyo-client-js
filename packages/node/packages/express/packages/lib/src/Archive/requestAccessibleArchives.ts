import { Request } from 'express'

import { requestCanAccessArchive } from './requestCanAccessArchive'

/**
 * Returns the subset of archives, from the supplied list, that the request can access
 * @param req The incoming request
 * @param archives A list of archives the request might potentially want to access
 * @returns The filtered list of archives the request can access
 */
export const requestAccessibleArchives = async (req: Request, archives: string[]): Promise<string[]> => {
  const accessible = await Promise.all(archives.map((archive) => requestCanAccessArchive(req, archive)))
  const accessibleArchives: string[] = []
  for (let i = 0; i < accessible.length; i++) {
    if (accessible[i]) accessibleArchives.push(archives[i])
  }
  return accessibleArchives
}
