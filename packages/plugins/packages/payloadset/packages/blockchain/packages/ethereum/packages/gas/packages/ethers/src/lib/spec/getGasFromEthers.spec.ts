import { InfuraProvider } from '@ethersproject/providers'
import { testIf } from '@xylabs/jest-helpers'

import { getGasFromEthers } from '../getGasFromEthers'

const projectId = process.env.INFURA_PROJECT_ID || ''
const projectSecret = process.env.INFURA_PROJECT_SECRET || ''

describe('getGasFromEthers', () => {
  testIf(projectId && projectSecret)('returns prices', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret })
    const result = await getGasFromEthers(provider)
    expect(result).toBeObject()
    expect(result.gasPrice).toBeNumber()
    expect(result.lastBaseFeePerGas).toBeNumber()
    expect(result.maxFeePerGas).toBeNumber()
    expect(result.maxPriorityFeePerGas).toBeNumber()
  })
})
