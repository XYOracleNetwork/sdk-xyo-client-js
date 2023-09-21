import { Listener, Web3Provider } from '@ethersproject/providers';
import { MetaMaskInpageProvider } from '@metamask/providers';

export class MetaMaskConnector {
  private account = ''
  private ethereum = window.ethereum as MetaMaskInpageProvider

  private listeners: Listener[] = []
  private providerListeners: [event: string, listener: Listener][] = []
  private provider: Web3Provider | undefined

  constructor(provider?: Web3Provider) {
    if (provider) {
      this.provider = provider
    } else if (this.ethereum) {
      this.provider = new Web3Provider(window.ethereum)
    }
  }

  get chainId() {
    return this.ethereum?.networkVersion
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

  async requestAccounts(): Promise<string[] | null> {
    if (!this.provider) {
      this.logProviderMissing()
      return
    }

    return await this.provider.send('eth_requestAccounts', [])
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

  /** Web3Provider Listeners - https://docs.ethers.org/v5/api/providers/provider/#Provider--events */
  on(event: string, listener: Listener) {
    this.provider?.on(event, listener)
    this.listeners.push(listener)
  }

  removeListener(event: string, listener: Listener) {
    this.provider?.removeListener(event, listener)
    this.listeners = this.listeners.filter((savedListener) => listener !== savedListener)
  }

  removeListeners() {
    this.provider?.removeAllListeners()
  }

  /** 
   * EIP-1193 Event Listeners
   * 
   * .on in Web3Provider does not understand EIP-1193 events
   * see - https://github.com/ethers-io/ethers.js/discussions/1560#discussioncomment-730893
   */
  onAccountsChanged(listener: Listener) {
    this.ethereum?.on('accountsChanged', listener)
    this.providerListeners.push(['accountsChanged', listener])
  }

  onDisconnect(listener: Listener) {
    this.ethereum?.on('disconnect', listener)
    this.providerListeners.push(['disconnect', listener])
  }

  onChainChanged(listener: Listener) {
    this.ethereum?.on('chainChanged', listener)
    this.providerListeners.push(['chainChanged', listener])
  }

  onConnect(listener: Listener) {
    this.ethereum?.on('connect', listener)
    this.providerListeners.push(['connect', listener])
  }

  removeProviderListener(event: string, listener: Listener) {
    this.ethereum?.removeListener(event, listener)
    this.providerListeners = this.providerListeners.filter(([,savedListener]) => listener !== savedListener)
  }

  removeProviderListeners() {
    this.providerListeners.forEach(([event, listener]) => this.ethereum?.removeListener(event, listener))
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
