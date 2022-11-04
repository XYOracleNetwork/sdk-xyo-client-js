import { NoReqBody, NoReqQuery, NoResBody } from '@xylabs/sdk-api-express-ecs'
import { XyoArchive } from '@xyo-network/api'
import { ArchiveLocals, ArchivePathParams } from '@xyo-network/node-core-model'
import { Request } from 'express'

export const isRequestUserOwnerOfArchive = (req: Request, archive: XyoArchive | null | undefined): boolean => {
  // If the archive doesn't exist or have an owner, they are not the owner
  if (!archive?.user) return false

  // If there's no user associated with this request, they're not the owner
  if (!req?.user?.id) return false

  // If the user from the request is the archive's owner
  return archive.user === req.user.id
}

export const isRequestUserOwnerOfRequestedArchive = (req: Request<ArchivePathParams, NoResBody, NoReqBody, NoReqQuery, ArchiveLocals>): boolean => {
  return isRequestUserOwnerOfArchive(req, req?.res?.locals?.archive)
}
