/* eslint-disable no-useless-escape */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { authConfig } from '@/configs/auth';
import { HttpException } from '@/exceptions/HttpException';
import { TokenPayload } from '@/types/core/auth/auth.types';
import { User } from '@/types/core/user/user.types';
import jwt from 'jsonwebtoken';
import chalk from 'chalk';

export type ForegroundColor =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'gray'
  | 'grey'
  | 'blackBright'
  | 'redBright'
  | 'greenBright'
  | 'yellowBright'
  | 'blueBright'
  | 'magentaBright'
  | 'cyanBright'
  | 'whiteBright';

export const dateRegex = /^([0-9]{4})-([0-9]{2})-([0-9]{2}):([0-9]{2}):([0-9]{2}):([0-9]{2})$/;

export const chalkObject = (obj: object, color: ForegroundColor): void => {
  console.log(chalk[color](JSON.stringify(obj, null, 2)));
};

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const _isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== 'number' && value === '') {
    return true;
  } else if (typeof value === 'undefined' || value === undefined) {
    return true;
  } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
    return true;
  } else {
    return false;
  }
};

export const getTwoDigitsId = (id: number) => {
  return `${id < 10 ? `0${id}` : id}`;
};

/**
 * @param str camelized string
 * @returns snakelized string
 */
export function snakelizeStr(str: string): string {
  const separator = '_';
  const split = /(?=[A-Z])/;
  return str.split(split).join(separator).toLowerCase();
}

/**
 * @param str snakelized string
 * @returns camelized string
 */
export function camelizeStr(key: string): string {
  // eslint-disable-next-line no-useless-escape
  key = key.replace(/[\-_\s]+(.)?/g, function (match, ch) {
    return ch ? ch.toUpperCase() : '';
  });
  // Ensure 1st char is always lowercase
  return key.substr(0, 1).toLowerCase() + key.substr(1);
}

export function signUserToken(user: User, expiresIn: number, secret: string) {
  const payload: TokenPayload = {
    idUser: user.idUser,
  };

  return jwt.sign(payload, secret, {
    expiresIn: expiresIn,
  });
}

/**
 * Validate provided token. It shouldn't have expired and should be well formed.
 * If that is true, decoded will be returned.
 * @param token token to validate
 * @param type secret to decode token
 * @throws HttpException when any rule is broken
 * @returns decoded token if it's valid
 */
export function validateToken(
  token: string,
  type: 'access' | 'refresh',
  requiredKeys: string[],
): TokenPayload {
  const secret = type === 'access' ? authConfig.accessSecret : authConfig.refreshSecret;
  let decoded: TokenPayload;

  try {
    // Is jwt?
    decoded = jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new HttpException(401, `Invalid ${type} token`);
  }

  // Is well formed?
  const isWellFormed = requiredKeys.every(key => Object.keys(decoded).find(dKey => dKey === key));
  // If it's not well formed
  if (!decoded || !isWellFormed)
    throw new HttpException(401, `${_titleCase(type)} token payload isn't valid`);
  // If token is expired
  if (Date.now() >= decoded.exp * 1000)
    throw new HttpException(401, `${_titleCase(type)} token expired`);

  return decoded;
}

export function _objectWithoutProperties<T>(obj: object, keys: Array<keyof T>) {
  const target: object = {};

  for (const i in obj) {
    const key = i as keyof T;
    if (keys.indexOf(key) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
}

/**
 * Use this method to map dinamicly a object.
 * @param obj object with any keys
 * @param keys keys you want to extract
 * @returns object with only the keys you provided (extracted from obj)
 */
export function _objectWithProperties<T>(obj: object, keys: Array<keyof T>) {
  const target: object = {};

  for (const i in obj) {
    const key = i as keyof T;
    if (keys.indexOf(key) === -1) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
}

export function _titleCase(str: string) {
  const first = str.substr(0, 1).toUpperCase();
  return first + str.substr(1);
}

export function _varName(obj: object) {
  return Object.keys(obj)[0];
}

/** Useful method to validate route params that should be a number */

export function isId(id: number, name?: string): boolean {
  if (!id || typeof id !== 'number') throw new HttpException(400, `${name ?? 'ID'} must be a number`);
  return true;
}

export function between(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}
