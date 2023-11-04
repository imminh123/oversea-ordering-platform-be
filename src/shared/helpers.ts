import { MongooseModuleOptions } from '@nestjs/mongoose';
import * as BPromise from 'bluebird';
import * as jsonWebToken from 'jsonwebtoken';
import { getConfig } from '../modules/config/config.provider';
import { Decimal128, ObjectId } from 'bson';
import * as _ from 'lodash';
import { Model } from 'mongoose';
import * as moment from 'moment-timezone';
import { DEFAULT_TIMEZONE } from './constant';
import { BadRequestException } from '@nestjs/common';
import { Errors } from '../modules/errors/errors';

const jwt = BPromise.promisifyAll(jsonWebToken);

export function createMongooseOptions(
  uriConfigPath: string,
): MongooseModuleOptions {
  return {
    uri: getConfig().get(uriConfigPath),
  };
}

export function decodeJWTToken(token: string) {
  return jwt.decode(token);
}

export function convertObject(
  obj: any,
  options: ConvertObjectOptions = {},
): any {
  const defaultReplacer = (value) => {
    if (value instanceof ObjectId) {
      return value.toHexString();
    }
    if (
      value &&
      (value instanceof Decimal128 || value.constructor.name === 'Decimal128')
    ) {
      return Number(value.toString());
    }
    if (value instanceof Set) {
      return convertSetToObject(value);
    }
    if (value instanceof Map) {
      return convertMapToPlainObject(value);
    }
  };
  const {
    exclude = [],
    excludePrefix = '_',
    replacer = defaultReplacer,
    keymap = { _id: 'id' },
  } = options;
  const resultObj = _.cloneDeepWith(obj, replacer);
  if (_.isPlainObject(resultObj) || _.isArray(resultObj)) {
    forOwnRecursive(resultObj, (value, path) => {
      const key = _.last(path);
      const newKey = _.isFunction(keymap)
        ? (keymap as any)(key)
        : _.get(keymap, key);
      if (newKey) {
        _.set(resultObj, _.concat(_.dropRight(path), newKey), value);
      }
    });
    forOwnRecursive(resultObj, (value, path) => {
      if (excludePrefix && _.last(path).startsWith(excludePrefix)) {
        _.unset(resultObj, path);
      }
      _.forEach(exclude, (field) => {
        if (_.isString(field)) {
          field = _.toPath(field);
        }
        if (_.isEqual(field, path)) {
          _.unset(resultObj, path);
          return false;
        }
      });
    });
  }
  return resultObj;
}

export interface ConvertObjectOptions {
  /**
   * Fields to exclude, either as dot-notation string or path array
   */
  exclude?: (string | string[])[];
  /**
   * Exclude properties starting with prefix
   */
  excludePrefix?: string;
  /**
   * Function to replace value (see lodash@cloneDeepWith)
   */
  replacer?: (value: any) => any;
  /**
   * Key-to-key mapping, or function
   */
  keymap?: { [key: string]: string } | ((key: string) => string);
}

export function convertSetToObject<T = any>(value: Set<T>): T[] {
  return Array.from(value.values());
}

export function convertMapToPlainObject<T = any>(
  value: Map<string, T>,
): { [key: string]: T } {
  return _.fromPairs(Array.from(value.entries()));
}

export function forOwnRecursive(
  obj: any,
  iteratee: (value: any, path: string[], obj: any) => any = _.identity,
) {
  return _.forOwn(obj, (value, key) => {
    const path = [].concat(key.toString());
    if (_.isPlainObject(value) || _.isArray(value)) {
      return forOwnRecursive(value, (v, p) => iteratee(v, path.concat(p), obj));
    }
    return iteratee(value, path, obj);
  });
}

const convertDbObject = (dbObj: any, exclude?: Array<string>): object => {
  const apiObj = {};

  if (dbObj instanceof Model) {
    dbObj = dbObj.toObject();
  }

  for (let name of Object.keys(dbObj)) {
    let value = dbObj[name];

    if (name === '_id') {
      name = 'id';
      value = value.toString();
    }

    if (name.startsWith('_')) {
      continue;
    }

    if (exclude && exclude.indexOf(name) >= 0) {
      continue;
    }

    apiObj[name] = value;
  }

  return apiObj;
};

export function db2api<T1, T2>(db: T1, exclude?: string[]): T2 {
  let response = null;

  if (Array.isArray(db)) {
    response = [];
    for (const obj of db) {
      response.push(convertDbObject(obj, exclude));
    }
  } else {
    response = convertDbObject(db, exclude);
  }

  return response;
}

export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export function getParamString(params) {
  const res = [];
  for (const [key, value] of Object.entries(params)) {
    res.push(`${key}=${value}`);
  }
  return res.join('&');
}

export function getHttpRequestLog(req) {
  if (!req) {
    return null;
  }

  return {
    timestamp: new Date().toISOString(),
    id: req.id,
    clientIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    method: req.method,
    originalUri: req.originalUrl,
    uri: req.url,
    referer: req.headers.referer || '',
    userAgent: req.headers['user-agent'],
    message: `HTTP Request - ${req.id}`,
    body: req.body,
    headers: req.headers,
  };
}
export const tenMb = 10000000;

export function getFileType(fileName: string) {
  const arr = fileName.split('.');
  return arr[arr.length - 1];
}

export function createTimeRange(from: Date, inMinute = 15) {
  return {
    from: moment(from).tz(DEFAULT_TIMEZONE).format('kk:mm'),
    to: moment(from)
      .tz(DEFAULT_TIMEZONE)
      .add(inMinute, 'minute')
      .format('kk:mm'),
  };
}

export function validateFromToFilterDate(fromDate?: Date, toDate?: Date) {
  if (fromDate && toDate) {
    if (moment(fromDate).isAfter(moment(toDate))) {
      throw new BadRequestException({
        ...Errors.GENERAL_VALIDATION_EXCEPTION,
        description: `From Date must be before To Date.`,
      });
    }
  }
  if (!fromDate && toDate) {
    throw new BadRequestException({
      ...Errors.GENERAL_VALIDATION_EXCEPTION,
      description: `From Date must be required with To Date.`,
    });
  }
}
export function isBefore(
  date: string | Date,
  compareDate: string | Date,
  timeRangeInMinute: number,
) {
  return moment(new Date(date))
    .subtract(timeRangeInMinute, 'minute')
    .isBefore(moment(new Date(compareDate)));
}

export function isAfter(
  date: string | Date,
  compareDate: string | Date,
  timeRangeInMinute: number,
) {
  return moment(new Date(date))
    .add(timeRangeInMinute, 'minute')
    .isBefore(moment(new Date(compareDate)));
}

export function buildFilterDateParam(fromDate?: Date, toDate?: Date) {
  if (fromDate) {
    fromDate = new Date(fromDate);
  }
  if (toDate) {
    toDate = new Date(toDate);
  }
  validateFromToFilterDate(fromDate, toDate);

  if (fromDate && toDate) {
    return {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
  }

  if (fromDate) {
    return {
      $gte: fromDate,
    };
  }

  return null;
}

export function createTimeStringWithFormat(
  date: Date | string,
  format,
  tz = DEFAULT_TIMEZONE,
) {
  return moment(new Date(date)).tz(tz).format(format);
}
