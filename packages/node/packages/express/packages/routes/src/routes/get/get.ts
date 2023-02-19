import { assertEx } from '@xylabs/assert'
import { asyncHandler, NoReqParams } from '@xylabs/sdk-api-express-ecs'
import { NodeWrapper } from '@xyo-network/modules'
// import { setRawResponseFormat } from '@xyo-network/express-node-middleware'
import { RequestHandler } from 'express'

const handler: RequestHandler<NoReqParams> = async (req, res) => {
  // setRawResponseFormat(res)
  const { node } = req.app
  const wrapper = NodeWrapper.wrap(assertEx(node, 'App has no node'))
  const description = await wrapper.describe()
  res.json(description)
}

export const getNode = asyncHandler(handler)
