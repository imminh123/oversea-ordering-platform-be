import mongoose, {
  Document,
  SaveOptions,
  Schema,
  QueryOptions,
} from 'mongoose';
import { convertObject } from '../helpers';
import { Decimal128 } from 'bson';

declare type DocumentSaveCallback<T> = (err: any, doc: T) => void;
export interface BaseDocument extends Document {
  createdAt?: Date;
  updatedAt?: Date;
  _deleted?: boolean;
  softDelete(fn?: DocumentSaveCallback<this>): Promise<this>;
  softDelete(
    options?: SaveOptions,
    fn?: DocumentSaveCallback<this>,
  ): Promise<this>;
  restore(fn?: DocumentSaveCallback<this>): Promise<this>;
  restore(
    options?: SaveOptions,
    fn?: DocumentSaveCallback<this>,
  ): Promise<this>;
}

export function getBaseSchema<T extends BaseDocument>(option = {}): Schema<T> {
  const schema = new Schema<T>(
    {
      _deleted: {
        type: Boolean,
        default: false,
      },
      createdAt: Date,
      updatedAt: Date,
      deletedAt: Date,
    },
    {
      timestamps: true,
      toObject: {
        transform: (_, ret) => convertObject(ret),
      },
      toJSON: {
        transform: (_, ret) => convertObject(ret),
      },
      ...option,
    },
  );

  schema.pre<T>('save', function (next) {
    if (!this._deleted) {
      this._deleted = false;
    }
    next();
  });

  const oriCast = mongoose.Schema.Types.Decimal128.cast();
  mongoose.Schema.Types.Decimal128.cast((v) => {
    if (v instanceof Decimal128) {
      return Number(v);
    }
    return oriCast(v);
  });

  schema.methods.softDelete = function (
    options?: SaveOptions | DocumentSaveCallback<T>,
    fn?: DocumentSaveCallback<T>,
  ) {
    if (typeof options === 'function') {
      fn = options;
      options = {};
    }
    this._deleted = true;
    this.deletedAt = new Date();
    return this.save(options, fn);
  } as T['softDelete'];

  schema.methods.restore = function (
    options?: SaveOptions | DocumentSaveCallback<T>,
    fn?: DocumentSaveCallback<T>,
  ) {
    if (typeof options === 'function') {
      fn = options;
      options = {};
    }
    this._deleted = false;
    this.deletedAt = undefined;
    return this.save(options, fn);
  } as T['restore'];

  return schema;
}

export interface FindOptions extends QueryOptions {
  tailable?: number;
  sort?: object | string;
  limit?: number;
  skip?: number;
  maxscan?: number;
  batchSize?: number;
  comment?: string;
  snapshot?: boolean;
  readPreference?: string;
  hint?: object;
}
