import { exists } from '@xylabs/exists'
import { asyncHandler, NoReqParams } from '@xylabs/sdk-api-express-ecs'
import { XyoArchive } from '@xyo-network/api'
import { defaultPublicArchives } from '@xyo-network/node-core-model'
import { RequestHandler } from 'express'

const getArchivesDistinctByName = (archives: XyoArchive[]): XyoArchive[] => {
  // Use a Map with the archive name as the key to produce an array
  // of distinct archives. If there are duplicates, the last occurrence
  // of the archive in the supplied array will be the one that is used.
  return [...new Map(archives.map((x) => [x.archive, x])).values()]
}

const handler: RequestHandler<NoReqParams, XyoArchive[]> = async (req, res) => {
  const id = req?.user?.id
  if (!id) {
    res.json(defaultPublicArchives)
  } else {
    const { archiveArchivist } = req.app
    const userArchives = (await archiveArchivist.find({ user: id })).filter(exists)
    res.json(getArchivesDistinctByName([...defaultPublicArchives, ...userArchives]))
  }
}

export const getArchives = asyncHandler(handler)
