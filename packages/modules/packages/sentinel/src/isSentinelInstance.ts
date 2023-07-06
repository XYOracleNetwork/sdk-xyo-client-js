import { IsInstanceFactory } from '@xyo-network/module'

import { SentinelInstance } from './SentinelModel'

export const isSentinelInstance = IsInstanceFactory.create<SentinelInstance>({ report: 'function' })
