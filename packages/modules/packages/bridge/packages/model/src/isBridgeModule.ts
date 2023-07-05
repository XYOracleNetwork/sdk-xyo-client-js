import { isModule, IsModuleFactory } from '@xyo-network/module-model'

import { BridgeModule } from './Bridge'

export const isBridgeModule = IsModuleFactory<BridgeModule>(isModule, [
  'targetConfig',
  'targetDiscover',
  'targetDownResolver',
  'targetQueries',
  'targetQuery',
  'targetQueryable',
  'targetResolve',
])
