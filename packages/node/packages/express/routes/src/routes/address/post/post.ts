import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { ModuleQueryResult } from '@xyo-network/module'
import { trimAddressPrefix } from '@xyo-network/node-core-lib'
import { RequestHandler } from 'express'

import { AddressPathParams } from '../AddressPathParams'

const handler: RequestHandler<AddressPathParams, ModuleQueryResult> = async (req, res, next) => {
  const { address } = req.params
  const { node } = req.app
  if (address) {
    const normalizedAddress = trimAddressPrefix(address).toLowerCase()
    const modules = node.address === normalizedAddress ? [node] : await node.tryResolve({ address: [normalizedAddress] })
    if (modules.length) {
      const mod = modules[0]
      const queryResult = await mod.query(req.body)
      res.json(queryResult)
      return
    }
  }
  // TODO: Return 404 instead?
  next('route')
}

export const postAddress = asyncHandler(handler)
