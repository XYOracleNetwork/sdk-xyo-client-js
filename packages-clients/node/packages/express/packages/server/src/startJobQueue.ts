import { container } from '@xyo-network/express-node-dependencies'
import { JobQueue } from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'

export const startJobQueue = async () => {
  if (!container.isBound(TYPES.JobQueue)) return
  const jobQueue = container.get<JobQueue>(TYPES.JobQueue)
  await jobQueue.start()
}
