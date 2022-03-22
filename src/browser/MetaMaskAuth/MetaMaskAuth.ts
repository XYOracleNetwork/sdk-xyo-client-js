import { Web3Provider } from '@ethersproject/providers'

import { XyoMetaMaskAuthConfig } from './MetaMaskAuthConfig'

class XyoMetaMaskConnector {
  private config: XyoMetaMaskAuthConfig
  private ethereum = window.ethereum

  constructor(config: XyoMetaMaskAuthConfig) {
    this.config = config
  }

  get currentAccount() {
    return this.ethereum?.selectedAddress
  }

  isMetaMaskInstalled() {
    return this.ethereum && this.ethereum.isMetaMask
  }

  isWalletIsConnected = () => {
    if (this.currentAccount) {
      console.log('Found an authorized account: ', this.ethereum?.selectedAddress)
      return true
    }
    return false
  }

  async connectWallet() {
    const accounts = await this.ethereum.request({ method: 'eth_requestAccounts' })
    // We could have multiple accounts. Check for one.
    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log('Connected: ', account)
    } else {
      console.log('No authorized account found.')
    }
  }

  async challengeWallet() {
    const provider = new Web3Provider(this.ethereum, 'any')
    await provider.send('eth_requestAccounts', [])

    const challengeResponse = await this.config.AuthApiService.walletChallenge(this.currentAccount)

    const message = challengeResponse.state
    const signer = provider.getSigner()
    await signer.getAddress()
    const signature = await signer.signMessage(message)

    const challenge = await this.config.AuthApiService.walletVerify(this.currentAccount, message, signature)
    return challenge
  }

  static get(config: XyoMetaMaskAuthConfig) {
    return new XyoMetaMaskConnector(config)
  }
}

export { XyoMetaMaskConnector }
