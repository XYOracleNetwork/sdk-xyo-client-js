import { AddressValue } from '../Key'

describe('AddressValue', () => {
  const valid: [string, string, string][] = [
    [
      'b35238cf5a1c52915b2149741d6841ee6a36bf59ec545928d68ec4b0036faa48',
      'e5c4d459c64b38b95c6b8d3597d4085b2f88c87e1b653351fd278c9092ebe1cb2e96ba28c80b61699f2dafd9f5cbe0aeb93078c4e8b246165a599310ab7b10e2',
      '336c46e57d17f4f9e2a5c85171027fe0e8993225',
    ],
    [
      '28cf6d3952fd24095a5e9ade3a0ce5d0789219a536d275657eb9816a92cf3ea8',
      '664e0b587c653fd0bbb533f5a6bdd27d68e96494fcd7657fbf2e6b6281b2b75502498ba7e64d6f149edff674cb9fe81c99a6870e65e39e4a7307eb8363e9f65e',
      '57359a536a343f957ad6c73108f9452df9b2d726',
    ],
    [
      '4cce5a4abefc91d0e93d2b3e39123ceb6de15e4f383d77078785fbfd78ea4301',
      'bb8c13260c43058e0238db8fd91c6e35f65331f6d237eff933fe3a879eca74e4137d47337cd86e7fdb4dd9c7548e83fb795e7a4d94691b406992be97bbe765a2',
      '6e20a2da9b94bd77e04834acc5a630a98d14bd3c',
    ],
    [
      '43f9941e762ccc9a037f8c1dadecf578937f265ecaf85ca8a73c85d467791632',
      '898c8b1388f49b3d433ff1fdc25d0789e2133ab1cdc1c5461058377d96f039595fa6c923268337da10afd303b97139930ba2ce846b1829d5db3ef37c5433efcc',
      'c6a675fb92d6c496158a2e4ec6fbb50837a89057',
    ],
    [
      'f54fe3a9663f5259241024ea20fc296937ae2a8149256744cec7f515f9c0bf68',
      '7380b85fb0e9e46e55ead4d34fa66167fb7745d202865f524ab3a1b3728786db455a7bfd0b2aa3a6e76a6c0020464075889aa2e2d26b13c8589562a0aa535ff1',
      'ca8acb608446f3a5c89b74754ef30fdb7fc2591c',
    ],
    [
      '538d1aadd8e1c45feff63c66ca397ff21a7feff969f4967ad64b1b22f5fbac9b',
      'bf00f704cbfae145726a358fc59cc6df1ec9965bc28f020c27673e57ca371eb1102e1990618760141e49825ac33bfa66ecb0a5597f6b4d50736242390f723722',
      '83e7596cd6551205c33ae76cda0fb619d9bb5932',
    ],
    [
      '87bc867209fa430152381b6c13724f3cf5e4b6e62d44cb2332042d279f3bb300',
      '9a77619f71e41a0acf5a00ba057c8092140ff247aeb28e13d0ee6f5ee6280a3d5b78841913fa434a92730ed739ceed28f398556f164f4d95f5ee8148acaf71ce',
      '81a0951a8d8cf3127b18577453fba372925e89c5',
    ],
    [
      '5266f8ffd5f45cef6611db587d07cab2119dfa09714d84e7966ca2eb28711e6f',
      '6e083eea0828613facee06186169ca785aff665e3890f3640bab1418f504ab9642a52bfd64fdc498329beeba77a3ab78ad2e7c9a04d0db534f06e8adc831d025',
      'a6e47b18e0a7d14a62d43443cc1ee44b733ca3e1',
    ],
    [
      '668e0e656311430d886d08b494e174556a25336347774d275f95fe4d12e00aab',
      'b052751b5c3c8f3fa1616a5cbcaecfcadaeb253e9e460000897b53262366a2fb23cd044aaa713b61a2841ffd2bb5fc97e96d5c7e85a552cd9e5572d42e4783ac',
      '6bb02a7b148dbf399010bb0836cb395d7cab3171',
    ],
    [
      '99ef40dddb13ef73de51ebee7a297d78ccf3390838efa704489bf03e27e50da1',
      '3ec5fc9ab65ae0219ea516a34f6bf5dd1f461c81a83cfe025a6ebae86df35ca37fb384f450f2681e461cd0d364610afabb98e70fddd39d028488e830fab0f936',
      '1294e0310e421ec1937d475c11ac6952b054b1be',
    ],
  ]

  // beforeAll(async () => {
  //   for (let index = 0; index < 10; index++) {
  //     const account = Account.random()
  //     const payload = { data: Math.random(), schema: 'network.xyo.test' }
  //     const boundWitness = await new BoundWitnessBuilder().payload(payload).witness(account).build()
  //     const message = PayloadHasher.hash(boundWitness[0])
  //     const signature = boundWitness[0]._signatures[0]
  //     const address = boundWitness[0].addresses[0]
  //     valid.push([message, signature, address])
  //   }
  // })
  describe('verify', () => {
    it.each(valid)('Verifies a signature', (message, signature, address) => {
      expect(AddressValue.verify(message, signature, address)).toBeTrue()
    })
  })
  describe('verifyAsync', () => {
    it.each(valid)('Verifies a signature', async (message, signature, address) => {
      const result = await AddressValue.verifyAsync(message, signature, address)
      expect(result).toBeTrue()
    })
  })
})
