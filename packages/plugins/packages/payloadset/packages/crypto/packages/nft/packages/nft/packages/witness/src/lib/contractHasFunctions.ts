import { Interface } from '@ethersproject/abi'
import { Contract } from '@ethersproject/contracts'

export const contractHasFunctions = async (contract: Contract, contractInterface: Interface, functionNames: string[]) => {
  const bytecode = await contract.provider.getCode(contract.address)
  for (let i = 0; i < functionNames.length; i++) {
    const nameSig = contractInterface.getSighash(functionNames[i]).substring(2)
    if (!bytecode.includes(nameSig)) {
      return false
    }
    return true
  }
  return false
}
