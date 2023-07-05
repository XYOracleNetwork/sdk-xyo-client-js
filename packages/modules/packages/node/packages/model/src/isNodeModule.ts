import { isModule, IsModuleFactory } from '@xyo-network/module'

import { NodeModule } from './Node'

export const isNodeModule = IsModuleFactory<NodeModule>(isModule, ['attach', 'attached', 'detach', 'registered'])
