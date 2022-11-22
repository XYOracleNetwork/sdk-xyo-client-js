import { InfuraProvider } from '@ethersproject/providers'

import { getGasFromEthers } from './getGasFromEthers'

const projectId = process.env.INFURA_PROJECT_ID || ''
const projectSecret = process.env.INFURA_PROJECT_SECRET || ''

const testIf = (condition: boolean | string | null | undefined) => (condition ? it : it.skip)

describe('getGasFromEthers', () => {
  testIf(projectId && projectSecret)('returns prices', async () => {
    const provider = new InfuraProvider('homestead', { projectId: process.env.INFURA_PROJECT_ID, projectSecret })
    const gas = await getGasFromEthers(provider)
    expect(gas).toBeTruthy()
  })
})
