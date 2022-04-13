import { ForestField } from '../src';
const thrower = () => {
  throw new Error('vey');
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

      it('should reflect touching, even if reset to initial value', () => {
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

    describe('validator', () => {
      describe('validator always fails', () => {
        describe('optional = false', () => {
          it('should be invalid if untouched', () => {
            const foo = new ForestField('foo', '', thrower, {
              optional: false,
            });

            expect(foo.valueWithSelectors().$isValid).toBeFalsy();
          });

          it('should be invalid if touched', () => {
            const foo = new ForestField('foo', '', thrower, {
              optional: false,
            });
            foo.do.update('bar');
            expect(foo.valueWithSelectors().$isValid).toBeFalsy();
          });
        });
        describe('optional = true', () => {
          it('should be valid if untouched', () => {
            const foo = new ForestField('virgin', '', thrower, {
              optional: true,
            });
            expect(foo.valueWithSelectors().$isValid).toBeTruthy();
          });

          it('should be invalid if touched', () => {
            const foo = new ForestField('foo', '', thrower, {
              optional: true,
            });
            foo.do.update('bar');
            expect(foo.valueWithSelectors().$isValid).toBeFalsy();
          });
        });
      });
    });
  });
});
