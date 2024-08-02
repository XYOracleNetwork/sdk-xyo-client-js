import { NodeHelper } from '@xyo-network/node-abstract'

import { attachToExistingNode } from './attachToExistingNode.ts'
import { attachToNewNode } from './attachToNewNode.ts'
import { flatAttachAllToExistingNode, flatAttachChildToExistingNode, flatAttachToExistingNode } from './flatAttachToExistingNode.ts'
import { flatAttachToNewNode } from './flatAttachToNewNode.ts'

export const MemoryNodeHelper = {
  ...NodeHelper,
  attachToExistingNode,
  attachToNewNode,
  flatAttachAllToExistingNode,
  flatAttachChildToExistingNode,
  flatAttachToExistingNode,
  flatAttachToNewNode,
}
