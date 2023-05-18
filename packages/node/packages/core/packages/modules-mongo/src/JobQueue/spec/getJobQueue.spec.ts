import { describeIf } from '@xylabs/jest-helpers'

import { canAddMongoModules } from '../../canAddMongoModules'
import { getJobQueue } from '../getJobQueue'

describeIf(canAddMongoModules())('getJobQueue', () => {
  it('gets the job queue', async () => {
    const jobQueue = await getJobQueue()
    expect(jobQueue).toBeObject()
  })
})
