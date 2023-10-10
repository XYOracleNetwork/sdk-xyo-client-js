import { assertEx } from '@xylabs/assert'
import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { Module, ModuleQueryResult } from '@xyo-network/module-model'
import { trimAddressPrefix } from '@xyo-network/node-core-lib'
import { Payload } from '@xyo-network/payload-model'
import { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'

import { AddressPathParams } from '../AddressPathParams'
import { getQueryConfig } from './getQueryConfig'

export type PostAddressRequestBody = [QueryBoundWitness, undefined | Payload[]]

const handler: RequestHandler<AddressPathParams, ModuleQueryResult, PostAddressRequestBody> = async (req, res, next) => {
  const { address } = req.params
  const { node } = req.app
  const [bw, payloads] = Array.isArray(req.body) ? req.body : []
  if (address && bw) {
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
          res.redirect(StatusCodes.TEMPORARY_REDIRECT, `/${moduleAddress}`)
          return
        }
      }
    }
    if (modules.length) {
      const mod = modules[0]
      const queryConfig = await getQueryConfig(mod, req, bw, payloads)
      const queryResult = await mod.query(bw, payloads, queryConfig)
      res.json(queryResult)
      return
    }
  }
  // TODO: Return 404 instead?
  next('route')
}

export const postAddress = asyncHandler(handler)
