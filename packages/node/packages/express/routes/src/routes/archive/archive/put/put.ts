import { assertEx } from '@xylabs/assert'
import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { XyoArchive } from '@xyo-network/api'
import { isLegacyPrivateArchive } from '@xyo-network/express-node-lib'
import { isValidArchiveName, setArchiveAccessPrivate } from '@xyo-network/node-core-lib'
import { ArchivePathParams } from '@xyo-network/node-core-model'
import { RequestHandler } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

const handler: RequestHandler<ArchivePathParams, XyoArchive, XyoArchive> = async (req, res, next) => {
  const { user } = req
  if (!user || !user?.id) {
    next({ message: 'Invalid User', statusCode: StatusCodes.UNAUTHORIZED })
    return
  }

  const archive = req.params.archive?.toLowerCase()
  if (!isValidArchiveName(archive)) {
    next({ message: 'Invalid Archive Name', statusCode: StatusCodes.BAD_REQUEST })
    return
  }

  const { archiveArchivist: archives, archivePermissionsArchivistFactory: permissions } = req.app
  const accessControl = req.body ? isLegacyPrivateArchive(req.body) : false
  try {
    // Create/update archive and set legacy permissions
    const results = await archives.insert([{ accessControl, archive, user: user.id }])
    const result = assertEx(results.pop(), 'Error inserting user')
    // Set newer permissions
    if (accessControl) {
      await setArchiveAccessPrivate(permissions(archive), archive)
    }
    res.status(result.updated ? StatusCodes.OK : StatusCodes.CREATED).json(result)
  } catch (error) {
    next({ message: ReasonPhrases.FORBIDDEN, statusCode: StatusCodes.FORBIDDEN })
  }
}

export const putArchive = asyncHandler(handler)
