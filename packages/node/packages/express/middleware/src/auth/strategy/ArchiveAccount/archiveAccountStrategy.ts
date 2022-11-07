import { NoReqQuery } from '@xylabs/sdk-api-express-ecs'
import { ArchiveLocals, ArchivePathParams, XyoBoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Strategy, StrategyCreated, StrategyCreatedStatic } from 'passport'

import { verifyOperationAllowedByAddress } from './verifyOperationAllowedByAddress'

export class ArchiveAccountStrategy extends Strategy {
  constructor() {
    super()
  }
  override async authenticate(
    this: StrategyCreated<this, this & StrategyCreatedStatic>,
    req: Request<ArchivePathParams, unknown, XyoBoundWitnessWithMeta[], NoReqQuery, ArchiveLocals>,
    _options?: unknown,
  ) {
    try {
      const allowed = await verifyOperationAllowedByAddress(req)
      if (!allowed) {
        // NOTE: This isn't always the case that if the operation wasn't allowed
        // AND the user wasn't logged in that the request is UNAUTHORIZED. It could
        // be that the schema the attempted wasn't allowed and logging in won't help.
        // TODO: Decompose verifyOperationAllowedByAddress to (not know about HTTP
        // status codes but still) return the reason the operation was disallowed
        // (address filter, schema permissions, etc.)
        if (!req.user?.address) {
          this.fail('Login required for operation on this archive', StatusCodes.UNAUTHORIZED)
        } else {
          this.fail('Account not authorized for operation on this archive', StatusCodes.FORBIDDEN)
        }
        return
      }
      this.success(req?.user || {})
      return
    } catch (error) {
      this.error({ message: 'ArchiveAccountStrategy Auth Error' })
    }
  }
}
