import type { MetaMaskInpageProvider } from '@metamask/providers'
import { forget } from '@xylabs/forget'
import { isString } from '@xylabs/typeof'
import type { Listener } from 'ethers'
import { BrowserProvider } from 'ethers'

declare global {
  var ethereum: MetaMaskInpageProvider | undefined
}

export class MetaMaskConnector {
  private account = ''
  private ethereum = globalThis.ethereum

  private listeners: Listener[] = []
  private provider: BrowserProvider | undefined
  private providerListeners: [event: string, listener: Listener][] = []

  constructor(provider?: BrowserProvider) {
    if (provider) {
      this.provider = provider
    } else if (this.ethereum) {
      this.provider = new BrowserProvider(this.ethereum)
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
    if (accounts.length > 0) {
      this.account = accounts[0]
      console.log('Connected:', this.account)
    } else {
      console.log('No authorized account found.')
    }
  }

  isMetaMaskInstalled() {
    return this.ethereum && this.ethereum.isMetaMask
  }

  isWalletIsConnected = () => {
    if (isString(this.currentAccount)) {
      console.log('Found an authorized account:', this.ethereum?.selectedAddress)
      return true
    }
    return false
  }

  /**
   * EIP-1193 Event Listeners
   *
   * .on in Web3Provider does not understand EIP-1193 events
   * see - https://github.com/ethers-io/ethers.js/discussions/1560#discussioncomment-730893
   */
  providerOnAccountsChanged(listener: Listener) {
    this.ethereum?.on('accountsChanged', listener)
    this.providerListeners.push(['accountsChanged', listener])
  }

  providerOnChainChanged(listener: Listener) {
    this.ethereum?.on('chainChanged', listener)
    this.providerListeners.push(['chainChanged', listener])
  }

  providerOnConnect(listener: Listener) {
    this.ethereum?.on('connect', listener)
    this.providerListeners.push(['connect', listener])
  }

  providerOnDisconnect(listener: Listener) {
    this.ethereum?.on('disconnect', listener)
    this.providerListeners.push(['disconnect', listener])
  }

  providerRemoveListener(event: string, listener: Listener) {
    // this.ethereum?.removeListener(event, listener)
    this.providerListeners = this.providerListeners.filter(([, savedListener]) => listener !== savedListener)
  }

  providerRemoveListeners() {
    // for (const [event, listener] of this.providerListeners) this.ethereum?.removeListener(event, listener)
  }

  async requestAccounts(): Promise<string[] | null> {
    if (!this.provider) {
      this.logProviderMissing()
      return null
    }

    return await this.provider.send('eth_requestAccounts', [])
  }

  async signMessage(message: string) {
    if (!this.provider) {
      this.logProviderMissing()
      return
    }

    const signer = await this.provider.getSigner()
    await signer.getAddress()
    return await signer.signMessage(message)
  }

  /** Web3Provider Listeners - https://docs.ethers.org/v5/api/providers/provider/#Provider--events */
  web3ProviderOn(event: string, listener: Listener): void {
    if (this.provider) {
      forget(this.provider.on(event, listener))
    }
    this.listeners.push(listener)
  }

  web3ProviderRemoveListener(event: string, listener: Listener): void {
    if (this.provider) {
      forget(this.provider.removeListener(event, listener))
    }
    this.listeners = this.listeners.filter(savedListener => listener !== savedListener)
  }

  web3ProviderRemoveListeners(): void {
    if (this.provider) {
      forget(this.provider.removeAllListeners())
    }
  }

  private logProviderMissing(): void {
    console.warn('Cannot call this method because there is no web3 provider connected.  Please confirm that metamask is installed')
  }
}
