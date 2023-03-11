import { MemoryNode } from '@xyo-network/modules'
import { MemorySentinel, SentinelConfig, SentinelConfigSchema, SentinelModule } from '@xyo-network/sentinel'

import { getAccount, WalletPaths } from '../../Account'
import { getArchivists } from '../../Archivists'
import { getProvider } from '../../Providers'
import { getCryptoMarketWitness } from '../../Witnesses'

export const getWitnessPanel = async (provider = getProvider()): Promise<SentinelModule> => {
  const account = getAccount(WalletPaths.CryptoMarketWitnessPanel)
  const archivists = await getArchivists()
  const witnesses = await getCryptoMarketWitness(provider)

  const node = (await MemoryNode.create()) as MemoryNode

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
  const config: SentinelConfig = {
    archivists: archivists.map((mod) => mod.address),
    schema: SentinelConfigSchema,
    witnesses: witnessAddresses,
  }
  const sentinel = await MemorySentinel.create({ account, config })
  return sentinel
}
