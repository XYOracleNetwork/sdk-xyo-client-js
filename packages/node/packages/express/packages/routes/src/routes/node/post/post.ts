import { asyncHandler, NoReqParams } from '@xylabs/sdk-api-express-ecs'
// import { setRawResponseFormat } from '@xyo-network/express-node-middleware'
import { RequestHandler } from 'express'

const handler: RequestHandler<NoReqParams> = async (req, res) => {
  // setRawResponseFormat(res)
  const { address } = req.params
  const { node } = req.app
  const [bw, payloads] = Array.isArray(req.body) ? req.body : []
  if (address && bw) {
    const queryResult = await node.query(bw, payloads)
    res.json(queryResult)
    return
  }
}

export const postNodeModule = asyncHandler(handler)
