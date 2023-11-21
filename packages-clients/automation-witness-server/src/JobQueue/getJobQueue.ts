import { JobQueue } from '@xyo-network/node-core-model'
import { Agenda } from 'agenda'

import { getName } from './getName'

/**
 * Collection to use for managing jobs
 */
const collection = 'automationWitness'

export const getJobQueue = async (): Promise<JobQueue> => {
  const address = process.env.MONGO_CONNECTION_STRING || 'mongodb://root:example@localhost:27017/job?authSource=admin'
  const db = { address, collection }
  const name = await getName()
  const jobQueue = new Agenda({ db, name })

  // TODO: Depends on minimum job interval, set to 20 seconds for
  // default since we should never be running jobs faster than every minute
  const jobProcessingInterval = process.env.JOB_PROCESSING_INTERVAL || '20 seconds'
  jobQueue.processEvery(jobProcessingInterval)

  return jobQueue
}
