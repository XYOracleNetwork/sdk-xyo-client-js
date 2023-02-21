import { asyncHandler, NoReqParams } from '@xylabs/sdk-api-express-ecs'
// import { setRawResponseFormat } from '@xyo-network/express-node-middleware'
import { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'

const handler: RequestHandler<NoReqParams> = async (req, res) => {
  // setRawResponseFormat(res)
  const { address } = req.params
  const { node } = req.app
  const [bw, payloads] = Array.isArray(req.body) ? req.body : []
  if (bw) {
    const queryResult = await node.query(bw, payloads)
    res.json(queryResult)
    return
  }
  res.sendStatus(StatusCodes.BAD_REQUEST)
  return
}

export const postNodeModule = asyncHandler(handler)
