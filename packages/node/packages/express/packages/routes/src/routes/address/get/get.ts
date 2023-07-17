import { assertEx } from '@xylabs/assert'
import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { ModuleWrapper } from '@xyo-network/module'
import { isModuleInstance, Module } from '@xyo-network/module-model'
import { trimAddressPrefix } from '@xyo-network/node-core-lib'
import { Payload } from '@xyo-network/payload-model'
import { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'

import { AddressPathParams } from '../AddressPathParams'

const handler: RequestHandler<AddressPathParams, Payload[]> = async (req, res, next) => {
  const { address } = req.params
  const { node } = req.app
  if (address) {
    let modules: Module[] = []
    const normalizedAddress = trimAddressPrefix(address).toLowerCase()
    if (node.address === normalizedAddress) modules = [node]
    else {
      const byAddress = await node.resolve({ address: [normalizedAddress] }, { direction: 'down' })
      if (byAddress.length) modules = byAddress
      else {
        const byName = await node.resolve({ name: [address] }, { direction: 'down' })
        if (byName.length) {
          const moduleAddress = assertEx(byName.pop()?.address, 'Error redirecting to module by address')
          res.redirect(StatusCodes.MOVED_TEMPORARILY, `/${moduleAddress}`)
          return
        }
      }
    }
    if (modules.length) {
      const module = modules[0]
      res.json(isModuleInstance(module) ? await module.discover() : await ModuleWrapper.wrap(module).discover())
      return
    }
  }
  next('route')
}

export const getAddress = asyncHandler(handler)
