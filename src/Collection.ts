import { Leaf, toMap } from '@wonderlandlabs/forest';
import { ForestField } from './ForestField';
import { FieldDef, FieldValue } from './types';

const NOOP = () => null;

interface FieldDefObj {
  [key: string]: FieldDef;
}

export class Collection extends Leaf {
  constructor(
    name,
    fields: FieldDef[] | Map<string, FieldDef> | FieldDefObj,
    restOptions?
  ) {
    const branches = new Map();

    toMap(fields).forEach((def: FieldDef, index) => {
      const {
        name = index,
        value = '',
        options = { optional: false },
        validator = NOOP,
      } = def;

      branches.set(name, new ForestField(name, value, validator, options));
    });

    const fieldsBranch = new Leaf(
      {
        restOptions: restOptions,
      },
      {
        name: 'fields',
        branches,
      }
    );

    super(
      {},
      {
        name,
        branches: {
          fields: fieldsBranch,
        },
        selectors: {
          isValid({ fields }) {
            console.log('isValid selector: fields', fields);
            const fieldsArray: FieldValue[] = Array.from(Object.values(fields));
            console.log('fieldsArray: ', fieldsArray);
            for (let i = 0; i < fieldsArray.length; ++i) {
              const field = fieldsArray[i];
              if (!field.$isValid) {
                return false;
              }
            }
            return true;
          },
        },
      }
    );
  }
}
