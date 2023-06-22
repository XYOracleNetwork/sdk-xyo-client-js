import { EtherscanProvider } from '@ethersproject/providers'
import { describeIf } from '@xylabs/jest-helpers'
import { AccessList, Transaction } from '@xyo-network/crypto-address-transaction-history-payload-plugin'

import { getTransactionsForAddress } from '../getTransactionsForAddress'

const validateAccessList = (accessList: AccessList) => {
  expect(accessList).toBeArray()
  for (const list of accessList) {
    expect(list.address).toBeString()
    expect(list.storageKeys).toBeArray()
    for (const storageKey of list.storageKeys) {
      expect(storageKey).toBeString()
    }
  }
}

const validateTransaction = (t: Transaction) => {
  if (t?.accessList) validateAccessList(t.accessList)
  if (t?.blockHash !== undefined) expect(t.blockHash).toBeString()
  if (t?.blockNumber !== undefined) expect(t.blockNumber).toBeNumber()
  expect(t.chainId).toBeNumber()
  expect(t.confirmations).toBeNumber()
  expect(t.data).toBeString()
  expect(t.from).toBeString()
  expect(t.gasLimit).toBeString()
  if (t?.gasPrice !== undefined) expect(t.gasPrice).toBeString()
  expect(t.hash).toBeString()
  if (t?.maxFeePerGas !== undefined) expect(t.maxFeePerGas).toBeString()
  if (t?.maxPriorityFeePerGas !== undefined) expect(t.maxPriorityFeePerGas).toBeString()
  expect(t.nonce).toBeNumber()
  if (t?.r !== undefined) expect(t.r).toBeString()
  if (t?.raw !== undefined) expect(t.raw).toBeString()
  if (t?.s !== undefined) expect(t.s).toBeString()
  if (t?.timestamp !== undefined) expect(t.timestamp).toBeNumber()
  if (t?.to !== undefined) expect(t.to).toBeString()
  if (t?.type !== undefined) t.type === null ? expect(t.type).toBeNull() : expect(t.type).toBeNumber()
  if (t?.v !== undefined) expect(t.v).toBeNumber()
  if (t?.value !== undefined) expect(t.value).toBeString()
}

describeIf(process.env.ETHERSCAN_API_KEY)('getTransactionsForAddress', () => {
  const address = '0x35C556C8e97509Bf1f6D286BB0137512E11711a6'
  const network = 'homestead'
  const apiKey = process.env.ETHERSCAN_API_KEY
  const provider = new EtherscanProvider(network, apiKey)
  test('observe', async () => {
    const transactions = await getTransactionsForAddress(address, provider)
    expect(transactions.length).toBeGreaterThan(0)
    for (const transaction of transactions) {
      validateTransaction(transaction)
    }
  })
})
