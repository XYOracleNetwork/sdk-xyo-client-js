import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { Module, ModuleDescription } from '@xyo-network/module-model'
import { trimAddressPrefix } from '@xyo-network/node-core-lib'
import { RequestHandler } from 'express'

import { AddressPathParams } from '../AddressPathParams'

const handler: RequestHandler<AddressPathParams, ModuleDescription> = async (req, res, next) => {
  const { address } = req.params
  const { node } = req.app
  if (address) {
    let modules: Module[] = []
    const normalizedAddress = trimAddressPrefix(address).toLowerCase()
    if (node.address === normalizedAddress) modules = [node]
    else {
      const byAddress = await node.tryResolve({ address: [normalizedAddress] })
      if (byAddress.length) modules = byAddress
      else {
        const byName = await node.tryResolve({ name: [address] })
        if (byName.length) modules = byName
      }
    }
    if (modules.length) {
      const mod = modules[0]
      const description = await mod.description()
      res.json(description)
      return
    }
  }
  next('route')
}

export const getAddress = asyncHandler(handler)
