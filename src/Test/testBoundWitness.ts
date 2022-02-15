import { XyoBoundWitness } from '../models'

const testBoundWitness: XyoBoundWitness = {
  _archive: 'test',
  _client: 'js',
  _hash: 'bdec11a360115deb2610f1628c8ca94b3d73823920a74eb232e319450a485648',
  _id: '6111f25cfd5e3f7645f06bc6',
  _signatures: [
    '628461a744840f7e4cfcd0f50a7e0baee4482c14ee3d858923eda52e64f568dc5b6ffc0f07f12b30b7a3ed6d1be3b4f7f398333931787bef1b32c49005bece7f',
    'abec9ffef45fdf9df8a9241e3db1d5af5222ddfdd898e3f6978f49017522e28daf762f562ba0be86abfdd84d5bc06e74d9180de38698ecfe1555d45ac78e3206',
    'fd5427629f652adb7f0b4f426c9720e78abee2b37bb9f846e19ea33c64b9a416c4bde3891e12f4a4b257a8f23df7cd0b75bbd57ffaa49fb8405abb72e29c182c',
    '97545e38c9a92c04451fe8d7ef335cdf039b6d84af39f4d7aed1b041fe993a83f1d5d52507b4c963451aee2361aa544fa6a5ab051b5b6bf52e89a094e3c38bab',
  ],
  _source_ip: '157.41.48.63',
  _timestamp: 1628566108362,
  _user_agent: 'Coin/2.7.6 (network.xyo.coin; build:1; iOS 14.7.1) Alamofire/5.4.3',
  addresses: [
    '801b6fefa650253cb08c5ed77403236e8bc6d1411e639e77903f46395bc542e4',
    '50923d96d15963ee4be3dac47ef76e3033c66bcb5ff3cda16e88ea081ae96db0',
    'd55621e211f6287c0fe946446cdf5a5667eda26d3a1f3b8090d4f187d6f3b7e2',
    'b2a8ca6bfa0961ebf492932c964b8fb80210b8ff7aa44512f70ed3e4e0a6b84c',
  ],
  payload_hashes: [
    '54cd4453b0eff9abcca9c58134664771e8fd51e88cc96d092268fe19b6b60075',
    'ad6cb516085461cde4b65c6bf738722897ba7d3089208fe51e3335b3387510b5',
    'cd52773513ae7d2e461fd0f61480e8c0304b478cf6ba9f0773eedd17107243df',
    '7530db33c95714b52fb030548d8411299fd98bb901db33aef789c42d9b572cf5',
  ],
  payload_schemas: [
    'co.coinapp.appStartWitness',
    'co.coinapp.currentUserWitness',
    'co.coinapp.currentLocationWitness',
    'network.xyo.system.info',
  ],
  previous_hashes: [null, null, null, null],
}

export { testBoundWitness }
