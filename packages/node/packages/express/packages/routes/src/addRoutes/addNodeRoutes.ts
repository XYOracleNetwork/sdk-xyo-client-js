import { allowAnonymous } from '@xyo-network/express-node-middleware'
import { Express } from 'express'
import { StatusCodes } from 'http-status-codes'

import { getAddress, getByHash, postAddress } from '../routes'

export const addNodeRoutes = (app: Express) => {
  // TODO: Allow other default modules to be mounted at root
  const defaultModule = app.node
  const address = defaultModule.address
  const defaultModuleEndpoint = `/${address}`
  app.get(
    '/',
    allowAnonymous,
    (_req, res) => res.redirect(StatusCodes.MOVED_TEMPORARILY, defaultModuleEndpoint),
    /* #swagger.tags = ['Node'] */
    /* #swagger.summary = 'Discovers the Node' */
  )
  app.post(
    '/',
    allowAnonymous,
    (_req, res) => res.redirect(StatusCodes.TEMPORARY_REDIRECT, defaultModuleEndpoint),
    /* #swagger.tags = ['Node'] */
    /* #swagger.summary = 'Execute the supplied queries, contained as Payloads in one or more Bound Witnesses, against the Node. Implementation is specific to the supplied payload schemas.' */
  )
  app.get(
    '/:address',
    allowAnonymous,
    getAddress,
    /* #swagger.tags = ['Node'] */
    /* #swagger.summary = 'Get the module info for the supplied address' */
  )
  app.post(
    '/:address',
    allowAnonymous,
    postAddress,
    /* #swagger.tags = ['Node'] */
    /* #swagger.summary = 'Execute the supplied queries, contained as Payloads in one or more Bound Witnesses. Implementation is specific to the supplied payload schemas.' */
  )
  app.get(
    '/:hash',
    allowAnonymous,
    getByHash,
    /* #swagger.tags = ['Node'] */
    /* #swagger.summary = 'Get the HURI from the archivist' */
  )
}
