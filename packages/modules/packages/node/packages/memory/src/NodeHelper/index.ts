import { NodeHelper } from '@xyo-network/node-abstract'

import { attachToExistingNode } from './attachToExistingNode.js'
import { attachToNewNode } from './attachToNewNode.js'
import { flatAttachAllToExistingNode, flatAttachChildToExistingNode, flatAttachToExistingNode } from './flatAttachToExistingNode.js'
import { flatAttachToNewNode } from './flatAttachToNewNode.js'

export const MemoryNodeHelper = {
  ...NodeHelper,
  attachToExistingNode,
  attachToNewNode,
  flatAttachAllToExistingNode,
  flatAttachChildToExistingNode,
  flatAttachToExistingNode,
  flatAttachToNewNode,
}
