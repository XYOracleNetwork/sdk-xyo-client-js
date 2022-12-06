import { AbstractNode } from '@xyo-network/modules'

import { NodeConfigurationFunction } from '../../model'
import { configureEnvironmentFromAWSSecret, configureEnvironmentFromDotEnv } from './providers'

export const configureEnvironment: NodeConfigurationFunction = async (node: AbstractNode) => {
  await configureEnvironmentFromDotEnv(node)
  await configureEnvironmentFromAWSSecret(node)
}
