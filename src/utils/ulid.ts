/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ulid.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: Tricked <https://tricked.pro>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/09/25 12:10:38 by Tricked           #+#    #+#             */
/*   Updated: 2021/09/25 12:10:59 by Tricked          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

//FORKED FROM ULID/javscript https://github.com/ulid/javascript/blob/master/lib/index.ts

export interface PRNG {
  (): number;
}

export interface ULID {
  (seedTime?: number): string;
}

// These values should NEVER change. If
// they do, we're no longer making ulids!
const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford's Base32
const ENCODING_LEN = ENCODING.length;
const TIME_MAX = Math.pow(2, 48) - 1;
const TIME_LEN = 10;
const RANDOM_LEN = 16;

export function replaceCharAt(str: string, index: number, char: string) {
  if (index > str.length - 1) {
    return str;
  }
  return str.substring(0, index) + char + str.substring(index + 1);
}

export function incrementBase32(str: string): string {
  let done!: string;
  let index = str.length;
  let char;
  let charIndex;
  const maxCharIndex = ENCODING_LEN - 1;
  while (!done && index-- >= 0) {
    char = str[index];
    charIndex = ENCODING.indexOf(char);

    if (charIndex === maxCharIndex) {
      str = replaceCharAt(str, index, ENCODING[0]);
      continue;
    }
    done = replaceCharAt(str, index, ENCODING[charIndex + 1]);
  }

  return done;
}

export function randomChar(prng: PRNG): string {
  let rand = Math.floor(prng() * ENCODING_LEN);
  if (rand === ENCODING_LEN) {
    rand = ENCODING_LEN - 1;
  }
  return ENCODING.charAt(rand);
}

export function encodeTime(now: number, len: number): string {
  if (isNaN(now)) {
    throw new Error(now + " must be a number");
  }
  let mod;
  let str = "";
  for (; len > 0; len--) {
    mod = now % ENCODING_LEN;
    str = ENCODING.charAt(mod) + str;
    now = (now - mod) / ENCODING_LEN;
  }
  return str;
}

export function encodeRandom(len: number, prng: PRNG): string {
  let str = "";
  for (; len > 0; len--) {
    str = randomChar(prng) + str;
  }
  return str;
}

export function decodeTime(id: string): number {
  var time = id
    .substring(0, TIME_LEN)
    .split("")
    .reverse()
    .reduce((carry, char, index) => {
      const encodingIndex = ENCODING.indexOf(char);

      return (carry += encodingIndex * Math.pow(ENCODING_LEN, index));
    }, 0);

  return time;
}

export function detectPrng(): PRNG {
  try {
    const nodeCrypto = require("crypto");
    return () => nodeCrypto.randomBytes(1).readUInt8() / 0xff;
  } catch (e) {}

  return () => Math.random();
}

export function factory(currPrng?: PRNG): ULID {
  if (!currPrng) {
    currPrng = detectPrng();
  }
  return function ulid(seedTime?: number): string {
    if (isNaN(seedTime as number)) {
      seedTime = Date.now();
    }
    return encodeTime(seedTime as number, TIME_LEN) + encodeRandom(RANDOM_LEN, currPrng as PRNG);
  };
}

export function monotonicFactory(currPrng?: PRNG): ULID {
  if (!currPrng) {
    currPrng = detectPrng();
  }
  let lastTime: number = 0;
  let lastRandom: string;
  return function ulid(seedTime?: number): string {
    if (isNaN(seedTime as number)) {
      seedTime = Date.now();
    }
    if ((seedTime as number) <= lastTime) {
      const incrementedRandom = (lastRandom = incrementBase32(lastRandom));
      return encodeTime(lastTime, TIME_LEN) + incrementedRandom;
    }
    lastTime = seedTime as number;
    const newRandom = (lastRandom = encodeRandom(RANDOM_LEN, currPrng as PRNG));
    return encodeTime(seedTime as number, TIME_LEN) + newRandom;
  };
}

export const ulid = factory();
