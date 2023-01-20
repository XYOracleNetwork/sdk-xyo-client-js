import { notImplemented } from '@xylabs/sdk-api-express-ecs'
import { allowAnonymous } from '@xyo-network/express-node-middleware'
import { Express } from 'express'

import { getAddress, getAddressHistory, postAddress } from '../routes'

export const addAddressRoutes = (app: Express) => {
  app.get(
    '/address',
    allowAnonymous,
    notImplemented,
    /* #swagger.tags = ['Address'] */
    /* #swagger.summary = 'Get list of Addresses in use' */
  )
  app.get(
    '/address/:address',
    allowAnonymous,
    getAddress,
    /* #swagger.tags = ['Address'] */
    /* #swagger.summary = 'Get information about Address' */
  )
  app.post(
    '/address/:address',
    allowAnonymous,
    postAddress,
    /* #swagger.tags = ['Address'] */
    /* #swagger.summary = 'Issues a query to the address' */
  )
  app.get(
    '/address/:address/boundwitness',
    allowAnonymous,
    getAddressHistory,
    /* #swagger.tags = ['Archive'] */
    /* #swagger.summary = 'Get BoundWitnesses history for Address' */
  )
}
