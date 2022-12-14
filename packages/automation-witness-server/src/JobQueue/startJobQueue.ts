import { JobQueue } from '@xyo-network/node-core-model'

export const startJobQueue = async (jobQueue: JobQueue) => {
  await jobQueue.start()
}
