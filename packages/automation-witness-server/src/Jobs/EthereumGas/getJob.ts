import { Job } from '@xyo-network/shared'

import { getTask } from './getTask'

const name = 'ethereumGasWitness'

export const getJob = (): Job => {
  const schedule: string = process.env.CRYPTO_MARKET_WITNESS_JOB_SCHEDULE || '10 minutes'
  const task = getTask()
  return { name, schedule, task }
}
