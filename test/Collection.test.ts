import { Collection } from '../src';

describe('ForestIO', () => {
  describe('Collection', () => {
    it('should have fields', () => {
      const collection = new Collection('greeks', {
        alpha: { value: 1 },
        beta: { value: 2 },
      });

      expect(collection.branch('fields.alpha').value.value).toBe(1);
      expect(collection.branch('fields.beta').value.value).toBe(2);
      expect(collection.valueWithSelectors().$isValid).toBeFalsy();
    });
  });

  describe('with optional fields', () => {
    it('should be truthy from the start: ', () => {
      const collection = new Collection('greeks', {
        alpha: { value: 1, options: { optional: true } },
        beta: { value: 2, options: { optional: true } },
      });
      expect(collection.valueWithSelectors().$isValid).toBeTruthy();
    });
  });
});
