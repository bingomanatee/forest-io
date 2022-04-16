import { isFn, Leaf, toMap } from '@wonderlandlabs/forest';
import { ForestField } from './ForestField';
import { FieldDef, FieldValue } from './types';
import {
  FORM_STATE_EDITING,
  FORM_STATE_ERROR,
  FORM_STATE_SAVED,
  FORM_STATE_SUBMITTING,
} from './constants';
import { errMessage, resultOrThrown } from './utils';

const NOOP = () => null;

interface FieldDefObj {
  [key: string]: FieldDef;
}

function fieldsToBranches(fields) {
  const branches = new Map();

  toMap(fields).forEach((def: FieldDef, index) => {
    const { name = index, value = '', validator = NOOP } = def;

    branches.set(name, new ForestField(name, value, validator, def));
  });

  return branches;
}

export class Form extends Leaf {
  constructor(
    name,
    fields: FieldDef[] | Map<string, FieldDef> | FieldDefObj,
    onSubmit: Function | null = null,
    validate: Function | null = null // any validation that cannot be achieved via individual field inspection
  ) {
    const branches = fieldsToBranches(fields);

    const fieldsBranch = new Leaf(
      {},
      {
        name: 'fields',
        branches,
      }
    );

    super(
      {
        status: FORM_STATE_EDITING,
        locked: false,
        err: null,
      },
      {
        name,
        setters: true,
        branches: {
          fields: fieldsBranch,
        },
        actions: {
          submit(leaf) {
            const { fieldsObj, $isValid, status } = leaf.valueWithSelectors();
            if (status !== FORM_STATE_EDITING) {
              console.warn('cannot submit - not editing');
              return null;
            }
            if (!$isValid) {
              console.warn('cannot submit - form is not valid');
              return null;
            }

            leaf.do.setStatus(FORM_STATE_SUBMITTING);
            if (onSubmit && isFn(onSubmit)) {
              return new Promise(async (done, fail) => {
                try {
                  const result = onSubmit(fieldsObj);
                  done(result);
                  leaf.do.setStatus(FORM_STATE_SAVED);
                } catch (err) {
                  fail(err);
                  leaf.do.setStatus(FORM_STATE_ERROR);
                  leaf.do.etError(err);
                }
              });
            }
            return null;
          },
        },
        selectors: {
          summary({ fields }) {
            const out = {};
            Object.keys(fields).forEach(name => {
              out[name] = fields[name].value;
            });
            return out;
          },
          isLocked({ status, locked }) {
            return locked || status === FORM_STATE_SUBMITTING;
          },
          isValid({ fields }) {
            const fieldsArray: FieldValue[] = Array.from(Object.values(fields));
            for (let i = 0; i < fieldsArray.length; ++i) {
              const field = fieldsArray[i];
              if (!field.$isValid) {
                return false;
              }
            }
            if (validate && isFn(validate)) {
              if (resultOrThrown(() => validate(fields, this))) {
                return false;
              }
            }
            return true;
          },
          formError({ fields }) {
            if (validate && isFn(validate)) {
              return resultOrThrown(() => validate(fields, this));
            }
            return false;
          },
          formErrorMessage({ fields }) {
            if (validate && isFn(validate)) {
              return errMessage(resultOrThrown(() => validate(fields, this)));
            }
            return false;
          },
        },
      }
    );

    Object.keys(fieldsBranch.value).forEach(fieldName => {
      const fieldBranch = fieldsBranch.branch(fieldName);
      fieldBranch.do.setForm(this);
    });
  }
}
