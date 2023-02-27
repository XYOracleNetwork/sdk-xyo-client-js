import { HDNode } from '@ethersproject/hdnode'

import { HDAccount } from '../HDAccount'

describe('HDAccount', () => {
  const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
  it('can be created from HDNode', () => {
    // TODO
    const node = HDNode.fromMnemonic(mnemonic)
    const sut = new HDAccount(node)
    expect(sut).toBeDefined()
  })
})
