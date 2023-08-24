import multiformats from 'multiformats'

//import dagcbor from '@ipld/dag-cbor'
import create from './create'
const IpfsBlock = create(multiformats)
//IpfsBlock.multiformats.multicodec.add(dagcbor)
export default IpfsBlock
