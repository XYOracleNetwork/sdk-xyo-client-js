import { asyncHandler } from '@xylabs/sdk-api-express-ecs'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { requestCanAccessArchive } from '@xyo-network/express-node-lib'
import {
  AbstractModule,
  AbstractModuleConfig,
  AbstractModuleConfigSchema,
  Module,
  ModuleQueryResult,
  XyoQueryBoundWitness,
} from '@xyo-network/module'
import { trimAddressPrefix } from '@xyo-network/node-core-lib'
import { ArchiveModuleConfig } from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Request, RequestHandler } from 'express'

import { AddressPathParams } from '../AddressPathParams'

export type PostAddressRequestBody = [XyoQueryBoundWitness, undefined | XyoPayload[]]

const getQueryConfig = async (
  mod: Module,
  req: Request,
  bw: XyoQueryBoundWitness,
  payloads?: XyoPayload[],
): Promise<AbstractModuleConfig | undefined> => {
  const archivist = mod as unknown as AbstractModule
  const config = archivist?.config as unknown as ArchiveModuleConfig
  const archive = config?.archive
  if (archive && (await requestCanAccessArchive(req, archive))) {
    // Recurse through payloads for nested BWs
    const nestedBwAddresses =
      payloads
        ?.flat(5)
        .filter<XyoBoundWitness>((payload): payload is XyoBoundWitness => payload?.schema === XyoBoundWitnessSchema)
        .map((bw) => bw.addresses) || []
    const allowed = Object.fromEntries(archivist.queries().map((schema) => [schema, [bw.addresses, ...nestedBwAddresses]]))
    const security = { allowed }
    return { schema: AbstractModuleConfigSchema, security }
  }
}

const handler: RequestHandler<AddressPathParams, ModuleQueryResult, PostAddressRequestBody> = async (req, res, next) => {
  const { address } = req.params
  const { node } = req.app
  const [bw, payloads] = Array.isArray(req.body) ? req.body : []
  if (address && bw) {
    const normalizedAddress = trimAddressPrefix(address).toLowerCase()
    const modules = node.address === normalizedAddress ? [node] : await node.tryResolve({ address: [normalizedAddress] })
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
