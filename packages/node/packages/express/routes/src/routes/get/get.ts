import { asyncHandler, NoReqParams } from '@xylabs/sdk-api-express-ecs'
// import { setRawResponseFormat } from '@xyo-network/express-node-middleware'
import { RequestHandler } from 'express'

const handler: RequestHandler<NoReqParams> = async (req, res) => {
  // setRawResponseFormat(res)
  const { node } = req.app
  const description = await node.description()
  res.json(description)
}

export const getNode = asyncHandler(handler)
