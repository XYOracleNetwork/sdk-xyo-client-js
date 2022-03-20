import { XyoBoundWitness } from '../models'

const testBoundWitness: XyoBoundWitness = {
  _archive: 'temp',
  _client: 'js',
  _hash: '8edaa9b8abf634493fbafc289deb42926873b6b9b6ed2d3701d750ebf867c877',
  _signatures: [
    '304502205d35409ea2b26796eaf96b2a7f72997e433900d32b44838dc3df892f6ea34b74022100eae5303befcc20dc271df72b752005224330659913fde8e4c95af5639772e737',
  ],
  _timestamp: 1645817103319,
  addresses: ['141289ba330b9cb1f1fe5d5356b6e90108ea37e6'],
  payload_hashes: ['8034c40b9c4c95d801a7fe2d714ef4d0770ced5169fa143357b0dbe31e3c8af9'],
  payload_schemas: ['network.xyo.system.info'],
  previous_hashes: ['b6d48d61e03a9580758cd352bc3659c39d7913cfc4d8a3a61f40c494486276ec'],
  schema: 'network.xyo.boundwitness',
}

export { testBoundWitness }
