import { assertEx } from '@xylabs/sdk-js'
import dotenv from 'dotenv'

import { XyoArchivistBoundWitnessMongoSdk } from './BoundWitnessSdk'

const getMongoSdk = (archive: string) => {
  dotenv.config()
  return new XyoArchivistBoundWitnessMongoSdk(
    {
      collection: 'bound_witnesses',
      dbConnectionString: process.env.MONGO_CONNECTION_STRING,
      dbDomain: assertEx(process.env.MONGO_DOMAIN, 'Missing Mongo Domain'),
      dbName: assertEx(process.env.MONGO_DATABASE, 'Missing Mongo Database'),
      dbPassword: assertEx(process.env.MONGO_PASSWORD, 'Missing Mongo Password'),
      dbUserName: assertEx(process.env.MONGO_USERNAME, 'Missing Mongo Username'),
    },
    archive
  )
}

test('all', async () => {
  const sdk = getMongoSdk('test')
  const plan = await sdk.findRecentPlan(100)
  console.log(`Plan: ${JSON.stringify(plan.queryPlanner.winningPlan, null, 2)}`)
})
