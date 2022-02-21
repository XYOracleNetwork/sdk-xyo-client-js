import { assertEx } from '@xylabs/sdk-js'
import dotenv from 'dotenv'

import { XyoArchivistBoundWitnessMongoSdk } from './BoundWitnessSdk'

const getMongoSdk = (archive: string) => {
  // eslint-disable-next-line import/no-named-as-default-member
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

describe('XyoArchivistBoundWitnessMongoSdk', () => {
  describe('findRecent', () => {
    it('uses an index to perform the query', async () => {
      if (process.env.MONGO_CONNECTION_STRING) {
        const sdk = getMongoSdk('test')
        const limit = 100
        const plan = await sdk.findRecentPlan(limit)
        expect(plan?.queryPlanner?.winningPlan?.inputStage?.inputStage?.stage).toBe('IXSCAN')
        // expect(plan?.queryPlanner?.winningPlan?.inputStage?.inputStage?.keysExamined).toBe(limit)
      }
    })
  })
})
