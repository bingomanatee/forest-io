import { ForestField } from '../src';
const thrower = () => {
  throw new Error('Always Fails');
};

const isNotBob = value => {
  if (value !== 'Bob') return 'you are not bob';
  return null;
};
describe('ForestIO', () => {
  describe('ForestField', () => {
    it('exists', () => {
      expect(ForestField).toBeTruthy();
    });

    describe('updateValue/touched', () => {
      it('should stay untouched even if same value is submitted', () => {
        const field = new ForestField('foo', '');

        expect(field.valueWithSelectors().touched).toBeFalsy();

        field.do.update('');

        expect(field.valueWithSelectors().touched).toBeFalsy();
      });

      it('should reflect touching, even if set to initial value', () => {
        const field = new ForestField('foo', '');

        field.do.update('bar');

        expect(field.valueWithSelectors().touched).toBeTruthy();

        field.do.update('');
        expect(field.valueWithSelectors().touched).toBeTruthy();
      });

      describe('with validator', () => {
        it('should stay untouched even if same value is submitted', () => {
          const field = new ForestField('foo', '', thrower);

          expect(field.valueWithSelectors().touched).toBeFalsy();

          field.do.update('');

          expect(field.valueWithSelectors().touched).toBeFalsy();
        });

        it('should reflect touching, even if reset to initial value', () => {
          const field = new ForestField('foo', '', thrower);

          field.do.update('bar');

          expect(field.valueWithSelectors().touched).toBeTruthy();

          field.do.update('');
          expect(field.valueWithSelectors().touched).toBeTruthy();
        });
      });
    });

    describe('$isValid', () => {
      describe('validator always fails', () => {
        it('should be invalid if untouched', () => {
          const foo = new ForestField('foo', '', thrower);
          expect(foo.valueWithSelectors().$isValid).toBeFalsy();
        });

        it('should be invalid if touched', () => {
          const foo = new ForestField('foo', '', thrower);
          foo.do.update('bar');
          expect(foo.valueWithSelectors().$isValid).toBeFalsy();
        });
      });

      describe('validator sometimes fails', () => {
        it('should be invalid if untouched', () => {
          const foo = new ForestField('foo', '', isNotBob);
          expect(foo.valueWithSelectors().$isValid).toBeFalsy();
        });

        it('should be invalid if set to wrong value', () => {
          const foo = new ForestField('foo', '', isNotBob);
          foo.do.update('bar');
          expect(foo.valueWithSelectors().$isValid).toBeFalsy();
        });

        it('should be valid if correct', () => {
          const foo = new ForestField('name', '', isNotBob);
          foo.do.update('Bob');
          expect(foo.valueWithSelectors().$isValid).toBeTruthy();
        });
      });
    });
    describe('$errorMessage', () => {
      describe('validator always fails', () => {
        it('should have error if untouched', () => {
          const foo = new ForestField('foo', '', thrower);
          expect(foo.valueWithSelectors().$errorMessage).toBe('Always Fails');
        });

        it('should be invalid if touched', () => {
          const foo = new ForestField('foo', '', thrower);
          foo.do.update('bar');
          expect(foo.valueWithSelectors().$errorMessage).toBe('Always Fails');
        });
      });

      describe('validator sometimes fails', () => {
        it('should be invalid if untouched', () => {
          const foo = new ForestField('foo', '', isNotBob);
          expect(foo.valueWithSelectors().$errorMessage).toBe(
            'you are not bob'
          );
        });

        it('should be invalid if set to wrong value', () => {
          const foo = new ForestField('foo', '', isNotBob);
          foo.do.update('bar');
          expect(foo.valueWithSelectors().$errorMessage).toBe(
            'you are not bob'
          );
        });

        it('should be valid if correct', () => {
          const foo = new ForestField('name', '', isNotBob);
          foo.do.update('Bob');
          expect(foo.valueWithSelectors().$errorMessage).toBeFalsy();
        });
      });
    });
  });
});
