import { getJobs } from './getJobs'

describe('getJobs', () => {
  it('gets the jobs', () => {
    const jobs = getJobs()
    expect(jobs).toBeArray()
    expect(jobs.length).toBeGreaterThan(0)
  })
})
