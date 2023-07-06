import { WithFactory } from '@xyo-network/module-model'

import { isDivinerInstance } from './isDivinerInstance'
import { isDivinerModule } from './isDivinerModule'

export const withDivinerInstance = WithFactory.create(isDivinerInstance)
export const withDivinerModule = WithFactory.create(isDivinerModule)
