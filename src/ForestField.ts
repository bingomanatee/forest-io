import { e, Leaf } from '@wonderlandlabs/forest';
import lGet from 'lodash/get';
import { ABSENT, errMessage, NOOP, resultOrThrown } from './utils';

class ForestField extends Leaf {
  constructor(
    name,
    value: any = '',
    validator: (value?, target?) => any = NOOP,
    data: { [key: string]: any } = {},
    form = null
  ) {
    function validate(value, target) {
      return resultOrThrown(() => validator(value, target));
    }

    super(
      {
        name,
        value,
        touched: false,
        data,
        form,
        locked: false,
        show: true,
      },
      {
        setters: true,
        res: { initialValue: value },
        selectors: {
          initialValue(_v, leaf) {
            return leaf.res('initialValue');
          },
          isLocked({ locked, form }) {
            if (locked) return true;
            if (form && form.valueWithSelectors().$isLocked) return true;
            return false;
          },
          isValid({ value }, leaf) {
            return !validate(value, leaf);
          },
          error({ value }, leaf) {
            return validate(value, leaf);
          },
          errorMessage({ value }, leaf) {
            const err = validate(value, leaf);
            if (!err) return '';
            return errMessage(err);
          },
        },
        actions: {
          reset(leaf, revertValue = ABSENT) {
            if (revertValue === ABSENT) {
              leaf.do.setValue(value);
            } else {
              leaf.do.setValue(leaf.value.initialValue);
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
            const { form, locked } = leaf.value;
            if (locked || (form && form.valueWithSelectors().$isLocked)) {
              console.warn('attempt to update locked field');
              return;
            }
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
