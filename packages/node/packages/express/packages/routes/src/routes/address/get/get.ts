import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { ModuleWrapper } from '@xyo-network/module'
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
      const byAddress = await node.resolve({ address: [normalizedAddress] })
      if (byAddress.length) modules = byAddress
      else {
        const byName = await node.resolve({ name: [address] })
        if (byName.length) modules = byName
      }
    }
    if (modules.length) {
      const wrapper = ModuleWrapper.wrap(modules[0])
      res.json(await wrapper.describe())
      return
    }
  }
  next('route')
}

export const getAddress = asyncHandler(handler)
