import { JobQueue } from '../../../../packages/packages-clients/node/packages/core/packages/model/src'

export const startJobQueue = async (jobQueue: JobQueue) => {
  await jobQueue.start()
}
