import * as ethers from '@ethersproject/providers'

export declare global {
  interface Window {
    ethereum: ethers
  }
}
