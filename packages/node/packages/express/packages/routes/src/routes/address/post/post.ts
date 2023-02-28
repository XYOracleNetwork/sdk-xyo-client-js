import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { ModuleQueryResult, XyoQueryBoundWitness } from '@xyo-network/module'
import { trimAddressPrefix } from '@xyo-network/node-core-lib'
import { XyoPayload } from '@xyo-network/payload-model'
import { RequestHandler } from 'express'

import { AddressPathParams } from '../AddressPathParams'
import { getQueryConfig } from './getQueryConfig'

export type PostAddressRequestBody = [XyoQueryBoundWitness, undefined | XyoPayload[]]

const handler: RequestHandler<AddressPathParams, ModuleQueryResult, PostAddressRequestBody> = async (req, res, next) => {
  const { address } = req.params
  const { node } = req.app
  const [bw, payloads] = Array.isArray(req.body) ? req.body : []
  if (address && bw) {
    const normalizedAddress = trimAddressPrefix(address).toLowerCase()
    const modules = node.address === normalizedAddress ? [node] : await node.downResolver.resolve({ address: [normalizedAddress] })
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
