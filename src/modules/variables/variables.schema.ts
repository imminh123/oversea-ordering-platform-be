import { getBaseSchema } from '../../shared/database/database.helpers';
import { IVariableDocument } from './variables.interface';

export const IVariableSchema = getBaseSchema<IVariableDocument>();

IVariableSchema.add({
  name: { type: String, required: false },
  value: { type: String, required: false },
  description: { type: String, required: false },
});
