import { CompositeModuleResolver, Module } from '@xyo-network/module'
import { MemoryNode } from '@xyo-network/modules'
import { AbstractSentinel, SentinelConfig, SentinelConfigSchema } from '@xyo-network/sentinel'

import { getAccount, WalletPaths } from '../../Account'
import { getArchivists } from '../../Archivists'
import { getProvider } from '../../Providers'
import { getCryptoMarketWitness } from '../../Witnesses'

export const getWitnessPanel = async (provider = getProvider()): Promise<AbstractSentinel> => {
  const account = getAccount(WalletPaths.CryptoMarketWitnessPanel)
  const archivists = await getArchivists()
  const witnesses = await getCryptoMarketWitness(provider)

  const config: SentinelConfig = {
    archivists: archivists.map((mod) => mod.address),
    schema: SentinelConfigSchema,
    witnesses: witnesses.map((mod) => mod.address),
  }
  const node = await MemoryNode.create()
  const sentinel = await AbstractSentinel.create({ account, config })
  const witnessAddresses = await Promise.all(
    witnesses.map(async (witness) => {
      await node.register(witness).attach(witness.address)
      return witness.address
    }),
  )
  await Promise.all(
    archivists.map(async (archivist) => {
      await node.register(archivist).attach(archivist.address)
      return archivist.address
    }),
  )
  sentinel.addWitness(witnessAddresses)
  return sentinel
}
