import 'reflect-metadata'

import { Logger } from '@xylabs/sdk-api-express-ecs'
import { UserManager } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Request } from 'express'
import { inject, injectable } from 'inversify'
import { Strategy, StrategyCreated, StrategyCreatedStatic } from 'passport'

import { verifyUuid } from './verifyUuid'
import { verifyWallet } from './verifyWallet'

@injectable()
export class Web3AuthStrategy extends Strategy {
  constructor(@inject(TYPES.Logger) public readonly logger: Logger, @inject(TYPES.UserManager) public readonly userManager: UserManager) {
    super()
  }
  override async authenticate(this: StrategyCreated<this, this & StrategyCreatedStatic>, req: Request, _options?: unknown) {
    try {
      const { message, signature } = req.body
      const { address } = req.params
      if (!address || !message || !signature) {
        this.fail('Missing request values')
        return
      }
      if (!verifyWallet(message, signature, address)) {
        this.fail('Invalid signature')
        return
      }
      if (!verifyUuid(message)) {
        this.fail('Invalid message')
        return
      }
      // Lookup existing user
      const user = await this.userManager.findByWallet(address)
      if (user) {
        // if found, return them
        this.success(user, { updated: false })
        return
      } else {
        // if not found, create them (since they've verified they own the wallet)
        const createdUser = await this.userManager.create({ address })
        if (!createdUser) {
          this.error({ message: 'Error creating user' })
          return
        }
        this.success(createdUser, { updated: createdUser.updated })
        return
      }
    } catch (error) {
      this.logger.error(JSON.stringify(error, null, 2))
      this.error({ message: 'Web3 Auth Error' })
    }
  }
}
