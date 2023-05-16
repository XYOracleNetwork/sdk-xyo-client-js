/* eslint-disable max-statements */
import { HDWallet } from '@xyo-network/account'
import { AddressHistoryDiviner } from '@xyo-network/diviner-address-history'
import { MemoryAddressSpaceDiviner } from '@xyo-network/diviner-address-space'
import { MemoryForecastingDiviner } from '@xyo-network/diviner-forecasting'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/modules'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

const getWallet = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  return HDWallet.fromMnemonic(mnemonic)
}

const getAddressHistoryDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.AddressHistory,
    config: { name: TYPES.AddressHistoryDiviner.description, schema: AddressHistoryDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(AddressHistoryDiviner, params)
}
const getAddressSpaceDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.AddressSpace,
    config: { name: TYPES.AddressSpaceDiviner.description, schema: MemoryAddressSpaceDiviner.configSchema },
    wallet,
  }
  return new ModuleFactory(MemoryAddressSpaceDiviner, params)
}
// const getBoundWitnessDiviner = (container: Container) => {
//   const wallet = getWallet(container)
//   const params = {
//     accountDerivationPath: WALLET_PATHS.Diviners.BoundWitness,
//     config: { name: TYPES.BoundWitnessDiviner.description, schema: MemoryBoundWitnessDiviner.configSchema },
//     wallet,
//   }
//   return new ModuleFactory(MemoryBoundWitnessDiviner, params)
// }
// const getBoundWitnessStatsDiviner = (container: Container) => {
//   const wallet = getWallet(container)
//   const params = {
//     accountDerivationPath: WALLET_PATHS.Diviners.BoundWitnessStats,
//     config: { name: TYPES.BoundWitnessStatsDiviner.description, schema: BoundWitnessStatsDiviner.configSchema },
//     wallet,
//   }
//   return new ModuleFactory(BoundWitnessStatsDiviner, params)
// }
const getMemoryForecastingDiviner = (container: Container) => {
  const wallet = getWallet(container)
  const forecastingMethod = 'arimaForecasting'
  const jsonPathExpression = '$.feePerGas.medium'
  const witnessSchema = 'network.xyo.blockchain.ethereum.gas'
  const params = {
    accountDerivationPath: WALLET_PATHS.Diviners.Forecasting,
    config: {
      forecastingMethod,
      jsonPathExpression,
      name: TYPES.ForecastingDiviner.description,
      schema: MemoryForecastingDiviner.configSchema,
      witnessSchema,
    },
    wallet,
  }
  return new ModuleFactory(MemoryForecastingDiviner, params)
}
// const getPayloadDiviner = (container: Container) => {
//   const wallet = getWallet(container)
//   const params = {
//     accountDerivationPath: WALLET_PATHS.Diviners.Payload,
//     config: { name: TYPES.PayloadDiviner.description, schema: PayloadDiviner.configSchema },
//     wallet,
//   }
//   return new ModuleFactory(PayloadDiviner, params)
// }
// const getPayloadStatsDiviner = (container: Container) => {
//   const wallet = getWallet(container)
//   const params = {
//     accountDerivationPath: WALLET_PATHS.Diviners.PayloadStats,
//     config: { name: TYPES.PayloadStatsDiviner.description, schema: PayloadStatsDiviner.configSchema },
//     wallet,
//   }
//   return new ModuleFactory(PayloadStatsDiviner, params)
// }
// const getSchemaListDiviner = (container: Container) => {
//   const wallet = getWallet(container)
//   const params = {
//     accountDerivationPath: WALLET_PATHS.Diviners.SchemaList,
//     config: { name: TYPES.SchemaListDiviner.description, schema: SchemaListDiviner.configSchema },
//     wallet,
//   }
//   return new ModuleFactory(SchemaListDiviner, params)
// }
// const getSchemaStatsDiviner = (container: Container) => {
//   const wallet = getWallet(container)
//   const params = {
//     accountDerivationPath: WALLET_PATHS.Diviners.SchemaStats,
//     config: { name: TYPES.SchemaStatsDiviner.description, schema: SchemaStatsDiviner.configSchema },
//     wallet,
//   }
//   return new ModuleFactory(SchemaStatsDiviner, params)
// }

export const addDivinerModuleFactories = (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[AddressHistoryDiviner.configSchema] = getAddressHistoryDiviner(container)
  dictionary[MemoryAddressSpaceDiviner.configSchema] = getAddressSpaceDiviner(container)
  // dictionary[BoundWitnessDiviner.configSchema] = getBoundWitnessDiviner(container)
  // dictionary[BoundWitnessStatsDiviner.configSchema] = getBoundWitnessStatsDiviner(container)
  dictionary[MemoryForecastingDiviner.configSchema] = getMemoryForecastingDiviner(container)
  // dictionary[PayloadDiviner.configSchema] = getPayloadDiviner(container)
  // dictionary[PayloadStatsDiviner.configSchema] = getPayloadStatsDiviner(container)
  // dictionary[SchemaListDiviner.configSchema] = getSchemaListDiviner(container)
  // dictionary[SchemaStatsDiviner.configSchema] = getSchemaStatsDiviner(container)
}
