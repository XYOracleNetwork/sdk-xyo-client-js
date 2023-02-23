import { asyncHandler, NoReqParams } from '@xylabs/sdk-api-express-ecs'
import { ModuleWrapper } from '@xyo-network/modules'
// import { setRawResponseFormat } from '@xyo-network/express-node-middleware'
import { RequestHandler } from 'express'

const handler: RequestHandler<NoReqParams> = async (req, res) => {
  // setRawResponseFormat(res)
  const { node } = req.app
  const wrapper = ModuleWrapper.wrap(node)
  res.json(await wrapper.describe())
}

export const getNode = asyncHandler(handler)
