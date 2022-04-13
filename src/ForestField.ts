import { e, Leaf } from '@wonderlandlabs/forest';
import lGet from 'lodash/get';
import { ABSENT, NOOP } from './utils';

class ForestField extends Leaf {
  constructor(
    name,
    value: any = '',
    validator: (value?, target?) => any = NOOP,
    options: { optional: boolean | null } = { optional: false }
  ) {
    const { optional } = options;

    function validate(value, target) {
      try {
        return validator(value, target);
      } catch (err) {
        return false;
      }
    }

    super(
      {
        name,
        value: value,
        touched: false,
        optional,
      },
      {
        selectors: {
          isValid({ value, touched, optional }, leaf) {
            if (!touched) {
              if (optional === true) {
                return true; // if untouched -- ASSUMES the value is absent and therefore true
              }
              if (optional === false) {
                return false; // if untouched AND not optional ASSUMES value must be TRUE
              }
            }

            return validate(value, leaf);
          },
        },
        actions: {
          revert(leaf, revertValue = ABSENT) {
            if (revertValue === ABSENT) {
              leaf.do.setValue(value);
            } else {
              leaf.do.setValue(revertValue);
            }
            leaf.do.setTouched(false);
          },
          updateFromEvent(leaf, event) {
            const value = lGet(event, 'target.value', ABSENT);
            if (value === ABSENT) {
              throw e('updateFromEvent called with bad event instance', {
                target: leaf,
                event,
              });
            }
            leaf.do.update(value);
          },
          update(leaf, value) {
            if (value === leaf.value.value) return;
            leaf.do.setValue(value);
            leaf.do.setTouched(true);
          },
        },
      }
    );
  }
}

export { ForestField };
