import { BaseDocument } from '../../shared/database/database.helpers';

export interface IVariable {
  name: string;
  value: string;
  description: string;
}
export interface IVariableDocument extends IVariable, BaseDocument {}
