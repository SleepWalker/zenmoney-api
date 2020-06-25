import { zenmoneyApi } from './';

it('should export api object', () => {
  expect(zenmoneyApi).toEqual(expect.any(Object));
});
