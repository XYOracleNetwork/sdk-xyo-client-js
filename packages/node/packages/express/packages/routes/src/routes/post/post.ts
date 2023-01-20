import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { StatusCodes } from 'http-status-codes'

import { formatRequest } from './formatRequest'
import { PostNodeRequestHandler } from './PostNodeRequestHandler'
import { queueQueries } from './queueQueries'

const handler: PostNodeRequestHandler = async (req, res) => {
  const boundWitnesses = formatRequest(req)
  // TODO: Validate protocol only here: new XyoBoundWitnessWrapper(bw).validator.all()
  const queued = queueQueries(boundWitnesses, req)
  const result: string[][] = await Promise.all(queued.map(async (x) => await Promise.all(x)))
  res.status(StatusCodes.ACCEPTED).json(result)
}

export const postNode = asyncHandler(handler)
