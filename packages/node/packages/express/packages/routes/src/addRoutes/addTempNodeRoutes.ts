import { allowAnonymous } from '@xyo-network/express-node-middleware'
import { Express } from 'express'

import { getAddress, getNode, postAddress, postNodeModule } from '../routes'

export const addTempNodeRoutes = (app: Express) => {
  app.get('/node/:address?', allowAnonymous, getNode)
  app.post('/node/:address?', allowAnonymous, postNodeModule)
  app.get('/node/:address?', allowAnonymous, getAddress)
  app.post('/node/:address?', allowAnonymous, postAddress)
}
