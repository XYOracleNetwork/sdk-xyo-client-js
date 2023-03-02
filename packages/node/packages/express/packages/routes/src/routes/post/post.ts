import { asyncHandler, NoReqParams } from '@xylabs/sdk-api-express-ecs'
import { ModuleQueryResult, XyoQueryBoundWitness } from '@xyo-network/modules'
import { XyoPayload } from '@xyo-network/payload-model'
import { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'

export type PostNodeRequestBody = [XyoQueryBoundWitness, undefined | XyoPayload[]]

const handler: RequestHandler<NoReqParams, ModuleQueryResult, PostNodeRequestBody> = async (req, res) => {
  const { node } = req.app
  const [bw, payloads] = Array.isArray(req.body) ? req.body : []
  if (!bw) {
    res.sendStatus(StatusCodes.BAD_REQUEST)
    return
  }
  // TODO: Get actual query config
  // const queryConfig = await getQueryConfig(mod, req, bw, payloads)
  const queryConfig = undefined
  const queryResult = await node.query(bw, payloads, queryConfig)
  res.json(queryResult)
  return
}

export const postNode = asyncHandler(handler)
