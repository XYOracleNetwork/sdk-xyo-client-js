/*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) */
import assert from '@noble/hashes/_assert'
import { pbkdf2, pbkdf2Async } from '@noble/hashes/pbkdf2'
import { sha256 } from '@noble/hashes/sha256'
import { sha512 } from '@noble/hashes/sha512'
import { utils as baseUtils } from '@scure/base'

export * from './wordlists/index.ts'

// Japanese wordlist
const isJapanese = (wordlist: string[]) => wordlist[0] === '\u3042\u3044\u3053\u304F\u3057\u3093'

// Normalization replaces equivalent sequences of characters
// so that any two texts that are equivalent will be reduced
// to the same sequence of code points, called the normal form of the original text.
function nfkd(str: string) {
  if (typeof str !== 'string') throw new TypeError(`Invalid mnemonic type: ${typeof str}`)
  return str.normalize('NFKD')
}

function normalize(str: string) {
  const norm = nfkd(str)
  const words = norm.split(' ')
  if (![12, 15, 18, 21, 24].includes(words.length)) throw new Error('Invalid mnemonic')
  return { nfkd: norm, words }
}

function assertEntropy(entropy: Uint8Array) {
  assert.bytes(entropy, 16, 20, 24, 28, 32)
}

const calcChecksum = (entropy: Uint8Array) => {
  // Checksum is ent.length/4 bits long
  const bitsLeft = 8 - entropy.length / 4
  // Zero rightmost "bitsLeft" bits in byte
  // For example: bitsLeft=4 val=10111101 -> 10110000
  return new Uint8Array([(sha256(entropy)[0] >> bitsLeft) << bitsLeft])
}

function getCoder(wordlist: string[]) {
  if (!Array.isArray(wordlist) || wordlist.length !== 2048 || typeof wordlist[0] !== 'string')
    throw new Error('Worlist: expected array of 2048 strings')
  for (const i of wordlist) {
    if (typeof i !== 'string') throw new Error(`Wordlist: non-string element: ${i}`)
  }
  return baseUtils.chain(baseUtils.checksum(1, calcChecksum), baseUtils.radix2(11, true), baseUtils.alphabet(wordlist))
}

/**
 * Reversible: Converts mnemonic string to raw entropy in form of byte array.
 * @param mnemonic 12-24 words
 * @param wordlist imported wordlist for specific language
 * @example
 * const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
 * mnemonicToEntropy(mnem, wordlist)
 * // Produces
 * new Uint8Array([
 *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f,
 *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f
 * ])
 */

/** @deprecated use @scure/bip39 instead */
export function mnemonicToEntropy(mnemonic: string, wordlist: string[]): Uint8Array {
  const { words } = normalize(mnemonic)
  const entropy = getCoder(wordlist).decode(words)
  assertEntropy(entropy)
  return entropy
}

/**
 * Reversible: Converts raw entropy in form of byte array to mnemonic string.
 * @param entropy byte array
 * @param wordlist imported wordlist for specific language
 * @returns 12-24 words
 * @example
 * const ent = new Uint8Array([
 *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f,
 *   0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f
 * ]);
 * entropyToMnemonic(ent, wordlist);
 * // 'legal winner thank year wave sausage worth useful legal winner thank yellow'
 */

/** @deprecated use @scure/bip39 instead */
export function entropyToMnemonic(entropy: Uint8Array, wordlist: string[]): string {
  assertEntropy(entropy)
  const words = getCoder(wordlist).encode(entropy)
  return words.join(isJapanese(wordlist) ? '\u3000' : ' ')
}

const salt = (passphrase: string) => nfkd(`mnemonic${passphrase}`)

/**
 * Irreversible: Uses KDF to derive 64 bytes of key data from mnemonic + optional password.
 * @param mnemonic 12-24 words
 * @param passphrase string that will additionally protect the key
 * @returns 64 bytes of key data
 * @example
 * const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
 * await mnemonicToSeed(mnem, 'password');
 * // new Uint8Array([...64 bytes])
 */

/** @deprecated use @scure/bip39 instead */
export function mnemonicToSeed(mnemonic: string, passphrase = '') {
  return pbkdf2Async(sha512, normalize(mnemonic).nfkd, salt(passphrase), { c: 2048, dkLen: 64 })
}

/**
 * Irreversible: Uses KDF to derive 64 bytes of key data from mnemonic + optional password.
 * @param mnemonic 12-24 words
 * @param passphrase string that will additionally protect the key
 * @returns 64 bytes of key data
 * @example
 * const mnem = 'legal winner thank year wave sausage worth useful legal winner thank yellow';
 * mnemonicToSeedSync(mnem, 'password');
 * // new Uint8Array([...64 bytes])
 */

/** @deprecated use @scure/bip39 instead */
export function mnemonicToSeedSync(mnemonic: string, passphrase = '') {
  return pbkdf2(sha512, normalize(mnemonic).nfkd, salt(passphrase), { c: 2048, dkLen: 64 })
}
