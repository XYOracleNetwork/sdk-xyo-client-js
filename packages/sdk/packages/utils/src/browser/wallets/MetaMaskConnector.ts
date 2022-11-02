import { Web3Provider } from '@ethersproject/providers'
import { MetaMaskInpageProvider } from '@metamask/providers'

class XyoMetaMaskConnector {
  private account = ''
  private ethereum = window.ethereum as MetaMaskInpageProvider
  private provider: Web3Provider | undefined

  constructor(provider?: Web3Provider) {
    if (provider) {
      this.provider = provider
    } else if (this.ethereum) {
      this.provider = new Web3Provider(window.ethereum)
    }
    this.provider?.on
  }

  get currentAccount() {
    return this.ethereum?.selectedAddress
  }

  async connectWallet() {
    if (!this.provider) {
      this.logProviderMissing()
      return
    }

    const accounts = await this.provider.send('eth_requestAccounts', [])
    // We could have multiple accounts. Check for one.
    if (accounts.length !== 0) {
      this.account = accounts[0]
      console.log('Connected: ', this.account)
    } else {
      console.log('No authorized account found.')
    }
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

  async signMessage(message: string) {
    if (!this.provider) {
      this.logProviderMissing()
      return
    }

    const signer = this.provider.getSigner()
    await signer.getAddress()
    const signature = await signer.signMessage(message)
    return signature
  }

  private logProviderMissing() {
    console.warn('Cannot call this method because there is no web3 provider connected.  Please confirm that metamask is installed')
  }
}

export { XyoMetaMaskConnector }
