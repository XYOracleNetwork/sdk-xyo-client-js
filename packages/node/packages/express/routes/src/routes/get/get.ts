// import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { NoReqParams } from '@xylabs/sdk-api-express-ecs'
// import { setRawResponseFormat } from '@xyo-network/express-node-middleware'
import { RequestHandler } from 'express'

const handler: RequestHandler<NoReqParams> = (req, res) => {
  // setRawResponseFormat(res)
  const { node } = req.app
  res.json(node.description)
}

// export const getNode = asyncHandler(handler)
export const getNode = handler
