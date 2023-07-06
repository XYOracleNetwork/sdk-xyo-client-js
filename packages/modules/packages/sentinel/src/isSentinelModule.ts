import { IsModuleFactory } from '@xyo-network/module'

import { SentinelReportQuerySchema } from './Queries'
import { SentinelModule } from './SentinelModel'

export const isSentinelModule = IsModuleFactory.create<SentinelModule>([SentinelReportQuerySchema])
