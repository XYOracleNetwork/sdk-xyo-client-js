import { NoReqBody, NoReqQuery, NoResBody } from '@xylabs/sdk-api-express-ecs'
import { isLegacyPrivateArchive, isRequestUserOwnerOfRequestedArchive } from '@xyo-network/express-node-lib'
import { ArchiveLocals, ArchivePathParams } from '@xyo-network/node-core-model'
import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Strategy, StrategyCreated, StrategyCreatedStatic } from 'passport'

export class ArchiveAccessControlStrategy extends Strategy {
  constructor() {
    super()
  }
  override authenticate(
    this: StrategyCreated<this, this & StrategyCreatedStatic>,
    req: Request<ArchivePathParams, NoResBody, NoReqBody, NoReqQuery, ArchiveLocals>,
    _options?: unknown,
  ) {
    try {
      // If it's not a public archive
      if (isLegacyPrivateArchive(req.res?.locals?.archive)) {
        // We require auth
        if (!req?.user?.id) {
          this.fail('Archive requires authorization', StatusCodes.UNAUTHORIZED)
          return
        } else {
          // Check if user has access to this archive
          if (!isRequestUserOwnerOfRequestedArchive(req)) {
            this.fail('User not authorized for archive', StatusCodes.FORBIDDEN)
            return
          }
        }
      }
      this.success(req.user || {})
      return
    } catch (error) {
      this.error({ message: 'ArchiveAccessControlStrategy Auth Error' })
    }
  }
}
