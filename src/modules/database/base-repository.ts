import {
  Model,
  SaveOptions,
  Document,
  ClientSession,
  UpdateWriteOpResult,
} from 'mongoose';
import { FindOptions } from './database.helpers';
import { slice, merge } from 'lodash';
import { ObjectId } from 'bson';
import { DeleteResult, TransactionOptions } from 'mongodb';

export interface Repository<T extends Document> {
  aggregate(aggregations?: any[]): Promise<any[]>;

  count(conditions: any): Promise<number>;

  findOne(findParams, options?: FindOptions): Promise<T>;

  findAll(findParams, option?: FindOptions, sort?: any): Promise<T[]>;

  findById(id: string): Promise<T>;

  create(doc: object, options?: SaveOptions): Promise<T>;

  create(docs: object[], options?: SaveOptions): Promise<T[]>;

  save(doc: T, options?: SaveOptions): Promise<T>;

  save(docs: T[], options?: SaveOptions): Promise<T[]>;

  updateOne(conditions: any, doc: any): Promise<T>;

  updateOneOrCreate(conditions: any, doc: any): Promise<T>;

  updateById(id: string, doc: any);

  delete(conditions: any);

  deleteById(id: string);

  createCollection(): Promise<void>;
}

export class BaseRepository<T extends Document> implements Repository<T> {
  constructor(public readonly model: Model<T>) {}

  aggregate(aggregations?: any[]): Promise<any[]> {
    aggregations = slice(aggregations);
    return this.model.aggregate(aggregations).exec();
  }

  async save(doc: T, options?: SaveOptions): Promise<T>;
  async save(docs: T[], options?: SaveOptions): Promise<T[]>;
  async save(docs: T | T[], options?: SaveOptions): Promise<T | T[]> {
    if (Array.isArray(docs)) {
      const result: T[] = [];
      for (const doc of docs) {
        result.push(await this.save(doc, options));
      }
      return result;
    }
    return docs.save(options);
  }

  async create(doc: object, options?: SaveOptions): Promise<T>;
  async create(docs: object[], options?: SaveOptions): Promise<T[]>;
  async create(
    docs: object | object[],
    options?: SaveOptions,
  ): Promise<T | T[]> {
    if (Array.isArray(docs)) {
      const result: T[] = [];
      for (const doc of docs) {
        result.push(await this.create(doc, options));
      }
      return result;
    }
    return this.save(new this.model(docs), options);
  }

  async findOne(findParams, options?: FindOptions): Promise<T> {
    return this.model.findOne(findParams, null, options).exec();
  }

  async findOneAndUpdate(findParams, doc, options?: FindOptions): Promise<T> {
    return this.model.findOneAndUpdate(findParams, doc, {
      new: true,
      ...options,
    });
  }

  async findAll(findParams, option?: FindOptions, sort?: any): Promise<T[]> {
    const query = this.model.find(findParams, {}, option);

    if (sort && Object.keys(sort).length > 0) {
      query.sort(sort);
    }
    return query.exec();
  }

  async count(conditions: any): Promise<number> {
    return this.model.countDocuments(conditions);
  }

  async findById(id: string): Promise<T> {
    return this.model.findById(id).exec();
  }

  async updateById(id: string, doc: any, options?: SaveOptions): Promise<T> {
    return this.model.findByIdAndUpdate(id, doc, { new: true, ...options });
  }

  async createCollection(): Promise<void> {
    if (!(await this.isCollectionExists())) {
      await this.model.createCollection();
    }
  }

  private async isCollectionExists(): Promise<boolean> {
    const result = await this.model.db.db
      .listCollections({ name: this.model.collection.collectionName })
      .next();

    return !!result;
  }

  async updateOne(conditions: any, doc: any): Promise<T> {
    return this.model.findOneAndUpdate(conditions, doc, { new: true });
  }

  async updateOneOrCreate(conditions: any, doc: any): Promise<T> {
    return this.model.findOneAndUpdate(conditions, doc, {
      new: true,
      upsert: true,
    });
  }

  async findOneOrCreate(
    conditions: any,
    doc: any,
    options?: FindOptions & SaveOptions,
  ): Promise<T> {
    let document;
    document = await this.findOne(conditions, options);
    if (!document) {
      document = await this.create(merge({}, conditions, doc), options);
    }
    return document;
  }

  async delete(conditions: any): Promise<DeleteResult> {
    return this.model.deleteMany(conditions);
  }

  async deleteById(id: string): Promise<DeleteResult> {
    return this.model.deleteOne({ _id: new ObjectId(id) });
  }

  async findByIdAndDelete(id: string): Promise<T> {
    return this.model.findByIdAndDelete(id);
  }

  async withTransaction<U>(
    fn: (session: ClientSession) => Promise<U>,
    options?: TransactionOptions,
  ): Promise<U> {
    const session = await this.model.db.startSession();
    let result: U;
    try {
      await session.withTransaction(async (ses) => {
        result = await fn(ses);
      }, options);
      return result;
    } finally {
      session.endSession().then().catch();
    }
  }

  async update(conditions: any, doc: any): Promise<UpdateWriteOpResult> {
    return this.model.updateMany(conditions, doc);
  }
}
