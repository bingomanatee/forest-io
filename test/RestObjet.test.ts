import { REST_SAVE, RestObject } from '../src';

describe('ForestIO', () => {
  describe('RestOptions', () => {
    describe('url', () => {
      it('should return the same url if no action urls are configured', () => {
        const user = new RestObject({}, 'user', ['name', 'email'], {
          url: '/api/user',
        });

        expect(user.url(REST_SAVE)).toBe('/api/user');
      });
    });
  });
});
