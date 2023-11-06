/* eslint-disable @typescript-eslint/no-explicit-any */
import { Interface } from '@ethersproject/abi'
import { constants } from 'ethers'

export function getInterfaceID(contractInterface: Interface, pick?: string[]) {
  let interfaceID = constants.Zero
  const functions: string[] = Object.keys(contractInterface.functions)
  for (let i = 0; i < functions.length; i++) {
    const functionName = functions[i].split('(')[0]
    console.log(`Checking: ${functionName}`)
    if (!pick || pick.includes(functionName)) {
      interfaceID = interfaceID.xor(contractInterface.getSighash(functions[i]))
    }
  }

  return interfaceID.toHexString()
}
