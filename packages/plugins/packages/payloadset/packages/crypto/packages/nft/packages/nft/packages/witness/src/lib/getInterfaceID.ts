import { Interface } from '@ethersproject/abi'
import { constants } from 'ethers'

export function getInterfaceID(contractInterface: Interface) {
  let interfaceID = constants.Zero
  const functions: string[] = Object.keys(contractInterface.functions)
  for (let i = 0; i < functions.length; i++) {
    interfaceID = interfaceID.xor(contractInterface.getSighash(functions[i]))
  }

  return interfaceID.toHexString()
}
