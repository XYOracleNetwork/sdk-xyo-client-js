import { getEnvFromAws } from '@xylabs/sdk-api-express-ecs'
import { MemoryNode } from '@xyo-network/modules'

import { NodeConfigurationFunction } from '../../../model'

export const configureEnvironmentFromAWSSecret: NodeConfigurationFunction = async (_node: MemoryNode) => {
  // If an AWS ARN was supplied for Secrets Manager
  const awsEnvSecret = process.env.AWS_ENV_SECRET_ARN
  if (awsEnvSecret) {
    // Merge the values from AWS into the current ENV
    // with AWS taking precedence
    const awsEnv = await getEnvFromAws(awsEnvSecret)
    Object.assign(process.env, awsEnv)
  }
}
