import { Form } from '../src';
const thrower = () => {
  throw new Error('Always Fails');
};
const isNotBob = value => {
  if (value !== 'Bob') return 'you are not bob';
  return null;
};
const isNonEnptyString = value => {
  return typeof value === 'string' && value.length > 0
    ? false
    : 'must be nonempty string';
};

function makeWizard() {
  const wizard = new Form('wizard', { name: { value: 'foo' } });
  wizard.do.addSubForm('address', {
    city: { value: '' },
    state: { value: '' },
  });
  wizard.do.addSubForm('contact', {
    email: {
      value: '',
      validator: value => {
        if (typeof value !== 'string') {
          return 'value must be a string';
        }
        if (!/.+@.+\..+/.test(value)) {
          return 'not a proper email';
        }
        return false;
      },
    },
    phone: { value: '' },
  });
  return wizard;
}

describe('ForestIO', () => {
  describe('Form', () => {
    it('should have fields', () => {
      const form = new Form('greeks', {
        alpha: { value: 1 },
        beta: { value: 2 },
      });
      expect(form.value.fields.alpha.value).toBe(1);
      expect(form.value.fields.beta.value).toBe(2);
    });

    describe('$summary', () => {
      const form = new Form('greeks', {
        alpha: { value: 1 },
        beta: { value: 2 },
      });
      expect(form.valueWithSelectors().$summary).toEqual({ alpha: 1, beta: 2 });
    });

    describe('$isValid', () => {
      describe('without validators', () => {
        const form = new Form('greeks', {
          alpha: { value: 1 },
          beta: { value: 2 },
        });
        expect(form.valueWithSelectors().$isValid).toBeTruthy();

        form.branch('fields.alpha').do.update('foo');

        expect(form.valueWithSelectors().$isValid).toBeTruthy();
      });

      describe('with validators', () => {
        describe('always fails', () => {
          const form = new Form('greeks', {
            alpha: { value: 1, validator: thrower },
            beta: { value: 2, validator: thrower },
          });
          expect(form.valueWithSelectors().$isValid).toBeFalsy();

          form.branch('fields.alpha').do.update('foo');

          expect(form.valueWithSelectors().$isValid).toBeFalsy();
        });
        describe('sometimes fails', () => {
          const form = new Form('greeks', {
            alpha: { value: 1, validator: isNotBob },
            beta: { value: 2, validator: isNotBob },
          });
          expect(form.valueWithSelectors().$isValid).toBeFalsy();

          form.branch('fields.alpha').do.update('Bob');
          form.branch('fields.beta').do.update('Bob');

          expect(form.valueWithSelectors().$isValid).toBeTruthy();
        });
        describe('with validator for form', () => {
          const form = new Form(
            'greeks',
            {
              alpha: { value: 1, validator: isNotBob },
              beta: { value: 2, validator: isNonEnptyString },
            },
            null,
            value => {
              const alphaValue = value.alpha.value;
              const betaValue = value.beta.value;
              if (alphaValue === betaValue) {
                return 'alpha and beta must be different';
              }
              return false;
            }
          );
          expect(form.valueWithSelectors().$isValid).toBeFalsy();

          form.branch('fields.alpha').do.update('Bob');
          form.branch('fields.beta').do.update('Rob');
          expect(form.valueWithSelectors().$isValid).toBeTruthy();

          form.branch('fields.beta').do.update('Bob');
          expect(form.valueWithSelectors().$isValid).toBeFalsy();
        });
      });
    });

    describe('nested forms', () => {
      it('should express sub-forms as a value', () => {
        const wizard = makeWizard();

        expect(wizard.valueWithSelectors().$summary).toEqual({
          address: {
            city: '',
            state: '',
          },
          contact: {
            email: '',
            phone: '',
          },
          name: 'foo',
        });
      });

      it('should allow you tu update values by key', () => {
        const wizard = makeWizard();

        wizard.do.update({
          contact: {
            email: 'a@b.com',
            phone: '999-123-4567',
          },
        });

        expect(wizard.valueWithSelectors().$summary).toEqual({
          address: {
            city: '',
            state: '',
          },
          contact: {
            email: 'a@b.com',
            phone: '999-123-4567',
          },
          name: 'foo',
        });
      });

      it('shares the validation of sub-forms', () => {
        const wizard = makeWizard();

        expect(wizard.valueWithSelectors().$isValid).toBeFalsy();
        wizard.do.update({
          contact: {
            email: 'a@b.com',
            phone: '999-123-4567',
          },
        });

        expect(wizard.valueWithSelectors().$isValid).toBeTruthy();
      });
    });
  });
});
