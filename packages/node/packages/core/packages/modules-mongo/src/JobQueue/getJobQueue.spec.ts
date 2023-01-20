import { getJobQueue } from './getJobQueue'

describe('getJobQueue', () => {
  it('gets the job queue', async () => {
    const jobQueue = await getJobQueue()
    expect(jobQueue).toBeObject()
  })
})
