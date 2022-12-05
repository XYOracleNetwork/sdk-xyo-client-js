import { AbstractNode } from '@xyo-network/modules'

import { NodeRegistrationFunction } from '../model'

export const addTransports: NodeRegistrationFunction = async (_node: AbstractNode) => {
  // Add Express, File, etc.
}
