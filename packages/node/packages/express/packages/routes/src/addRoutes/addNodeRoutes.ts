import { allowAnonymous } from '@xyo-network/express-node-middleware'
import { Express } from 'express'

import { getAddress, getByHash, getNode, postAddress, postNode } from '../routes'

export const addNodeRoutes = (app: Express) => {
  app.get(
    '/',
    allowAnonymous,
    getNode /* #swagger.tags = ['Node'] */,
    /* #swagger.summary = 'Gets modules on the Node' */
  )
  app.post(
    '/',
    allowAnonymous,
    postNode,
    /* #swagger.tags = ['Node'] */
    /* #swagger.summary = 'Execute the supplied queries, contained as Payloads in one or more Bound Witnesses. Implementation is specific to the supplied payload schemas.' */
  )
  app.get(
    '/:address',
    allowAnonymous,
    getAddress,
    /* #swagger.tags = ['Node'] */
    /* #swagger.summary = 'Get the module info for the supplied address' */
  )
  app.get(
    '/:hash',
    allowAnonymous,
    getByHash,
    /* #swagger.tags = ['Node'] */
    /* #swagger.summary = 'Get the HURI from the archivist' */
  )
  app.post(
    '/:address',
    allowAnonymous,
    postAddress,
    /* #swagger.tags = ['Node'] */
    /* #swagger.summary = 'Execute the supplied queries, contained as Payloads in one or more Bound Witnesses. Implementation is specific to the supplied payload schemas.' */
  )
}
