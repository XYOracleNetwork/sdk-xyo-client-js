import { NodeHelper } from '@xyo-network/node-abstract'

import { attachToExistingNode } from './attachToExistingNode'
import { attachToNewNode } from './attachToNewNode'
import { flatAttachAllToExistingNode, flatAttachChildToExistingNode, flatAttachToExistingNode } from './flatAttachToExistingNode'
import { flatAttachToNewNode } from './flatAttachToNewNode'

export const MemoryNodeHelper = {
  ...NodeHelper,
  attachToExistingNode,
  attachToNewNode,
  flatAttachAllToExistingNode,
  flatAttachChildToExistingNode,
  flatAttachToExistingNode,
  flatAttachToNewNode,
}
