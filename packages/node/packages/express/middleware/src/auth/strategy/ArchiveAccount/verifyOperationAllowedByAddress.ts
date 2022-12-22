import { NoReqQuery } from '@xylabs/sdk-api-express-ecs'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { isRequestUserOwnerOfRequestedArchive } from '@xyo-network/express-node-lib'
import { trimAddressPrefix } from '@xyo-network/node-core-lib'
import {
  ArchiveLocals,
  ArchivePathParams,
  SetArchivePermissions,
  SetArchivePermissionsSchema,
  XyoBoundWitnessWithMeta,
} from '@xyo-network/node-core-model'
import { XyoPayload } from '@xyo-network/payload-model'
import { Request } from 'express'

const defaultArchivePermissions: SetArchivePermissions = {
  schema: SetArchivePermissionsSchema,
}

const getArchivePermissions = async (req: Request<unknown, unknown, XyoBoundWitness[]>, archive: string): Promise<SetArchivePermissions> => {
  const permissions = await req.app.archivePermissionsArchivistFactory(archive).get([archive])
  return permissions && permissions?.[0] ? permissions?.[0] : defaultArchivePermissions
}

const verifyAccountAllowed = (address: string | undefined, permissions: SetArchivePermissions): boolean => {
  const allowedAddresses = permissions?.addresses?.allow
  const disallowedAddresses = permissions?.addresses?.reject

  // If there's address restrictions on the archive and this
  // is an anonymous request
  if ((allowedAddresses || disallowedAddresses) && !address) return false

  // If there's rejected addresses
  if (disallowedAddresses) {
    // And this address is one of them
    if (disallowedAddresses.some((disallowed) => trimAddressPrefix(disallowed.toLowerCase()) === address?.toLowerCase())) return false
  }
  // If there's allowed addresses
  if (allowedAddresses) {
    // Return true if this address is allowed, otherwise false
    return allowedAddresses.some((allowed) => trimAddressPrefix(allowed.toLowerCase()) === address?.toLowerCase()) ? true : false
  }
  return true
}
const verifySchemaAllowed = (schema: string, permissions: SetArchivePermissions): boolean => {
  const allowedSchemas = permissions?.schemas?.allow
  const disallowedSchemas = permissions?.schemas?.reject

  // If there's no schema restrictions on the archive
  if (!allowedSchemas && !disallowedSchemas) return true

  // TODO: Support GLOB patterns for allowed/disallowed schemas

  // If there's rejected schemas
  if (disallowedSchemas) {
    // And this schema is one of them
    if (disallowedSchemas.some((disallowed) => disallowed.toLowerCase() === schema.toLowerCase())) return false
  }
  // If there's allowed schemas
  if (allowedSchemas) {
    // Return true if this schema is allowed, otherwise false
    return allowedSchemas.some((allowed) => allowed.toLowerCase() === schema.toLowerCase()) ? true : false
  }
  return true
}

export const verifyOperationAllowedByAddress = async (
  req: Request<ArchivePathParams, unknown, XyoBoundWitnessWithMeta[], NoReqQuery, ArchiveLocals>,
): Promise<boolean> => {
  // NOTE: Communicate partial success for allowed/disallowed operations
  // Short circuit & reduce all operations to binary success/failure for now
  // Get archive permissions
  const { archive } = req.params
  if (!archive) return false
  if (isRequestUserOwnerOfRequestedArchive(req)) return true
  const permissions = await getArchivePermissions(req, archive)
  const address = req?.user?.address ? trimAddressPrefix(req?.user?.address?.toLowerCase()) : undefined
  if (!verifyAccountAllowed(address, permissions)) return false
  for (let i = 0; i < req.body.length; i++) {
    const bw = req.body[i]
    if (bw._payloads?.length) {
      for (let j = 0; j < bw._payloads.length; j++) {
        const p: XyoPayload = bw._payloads[j]
        if (!p.schema || !verifySchemaAllowed(p.schema, permissions)) return false
      }
    }
  }
  return true
}
