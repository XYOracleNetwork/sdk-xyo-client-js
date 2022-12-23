import 'reflect-metadata'

import { exists } from '@xylabs/exists'
import { getHttpHeader } from '@xylabs/sdk-api-express-ecs'
import { ArchiveArchivist, ArchiveKeyRepository, UserManager } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { Request } from 'express'
import { inject, injectable } from 'inversify'
import { Strategy, StrategyCreated, StrategyCreatedStatic } from 'passport'

@injectable()
export class ArchiveApiKeyStrategy extends Strategy {
  constructor(
    @inject(TYPES.ArchiveArchivist) public readonly archiveArchivist: ArchiveArchivist,
    @inject(TYPES.ArchiveKeyRepository) public readonly archiveKeyRepository: ArchiveKeyRepository,
    @inject(TYPES.UserManager) public readonly userManager: UserManager,
    public readonly apiKeyHeader = 'x-api-key',
  ) {
    super()
  }
  override async authenticate(this: StrategyCreated<this, this & StrategyCreatedStatic>, req: Request, _options?: unknown) {
    try {
      const apiKey = getHttpHeader(this.apiKeyHeader, req)?.toLowerCase()
      if (!apiKey) {
        this.fail('Missing API key in header')
        return
      }

      const { archive } = req.params
      if (!archive) {
        this.fail('Invalid archive')
        return
      }

      // Validate API Key is valid for this archive
      const result = await this.archiveKeyRepository.find({ archive })
      const keys = result.filter(exists).map((key) => key.key.toLowerCase())
      if (!keys.includes(apiKey)) {
        this.fail('Invalid API key')
        return
      }

      // Get the archive owner
      const existingArchives = await this.archiveArchivist.get([archive])
      const existingArchive = existingArchives.pop()
      if (!existingArchive || !existingArchive?.user) {
        this.fail('Invalid user')
        return
      }

      const user = await this.userManager.findById(existingArchive.user)
      if (!user) {
        this.fail('Invalid user')
        return
      }
      this.success(user)
      return
    } catch (error) {
      this.error({ message: 'Archive API Key Auth Error' })
    }
  }
}
