import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { ModuleDescription } from '@xyo-network/module'
import { trimAddressPrefix } from '@xyo-network/node-core-lib'
import { RequestHandler } from 'express'

import { AddressPathParams } from '../AddressPathParams'

const handler: RequestHandler<AddressPathParams, ModuleDescription> = async (req, res, next) => {
  const { address } = req.params
  const { node } = req.app
  if (address) {
    const normalizedAddress = trimAddressPrefix(address).toLowerCase()
    const mod = await node.tryResolve({ address: [normalizedAddress] })
    if (mod.length) {
      const description = await mod[0].description()
      res.json(description)
      return
    }
  }
  next('route')
}

export const getAddress = asyncHandler(handler)
