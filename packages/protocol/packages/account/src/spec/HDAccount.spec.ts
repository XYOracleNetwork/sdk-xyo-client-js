import { HDNode } from '@ethersproject/hdnode'

import { HDAccount } from '../HDAccount'

describe('HDAccount', () => {
  const hash = '6c21ca7cddc2822ea635a96ba1aa36bf08d0f57ffb2989870659a263e9f8ee3a'
  const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
  const node = HDNode.fromMnemonic(mnemonic)

  describe('constructor', () => {
    it('can be created from HDNode', () => {
      const sut = new HDAccount(node)
      expect(sut).toBeDefined()
    })
  })
  describe('sign', () => {
    it('signs hashes', () => {
      const sut = new HDAccount(node)
      expect(sut).toBeDefined()
      const signature = sut.sign(hash)
      expect(signature).toBeDefined()
      expect(signature.length).toBe(64)
    })
  })
  describe('previousHash', () => {
    describe('when nothing signed before', () => {
      it('returns undefined', () => {
        const sut = new HDAccount(node)
        expect(sut.previousHash?.hex).toBe(undefined)
      })
    })
    describe('when something signed before', () => {
      it('returns last signed value', () => {
        const sut = new HDAccount(node)
        sut.sign(hash)
        expect(sut.previousHash?.hex).toBe(hash)
      })
    })
    describe('when set via ctor', () => {
      it('returns last signed value', () => {
        const sut = new HDAccount(node, { previousHash: hash })
        expect(sut.previousHash?.hex).toBe(hash)
      })
    })
  })
})
