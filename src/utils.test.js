const { isFunction, toCamelCase, toSnakeCase } = require('./utils');

describe('isFunction', function () {
  test(`should return true if it's a function`, () => {
    const isAnonymousFuncLex = () => {};
    const isAnonymousFunc = function() {};
    function isFunc() {}
    class isClass {}
    expect(isFunction(isAnonymousFuncLex)).toBe(true);
    expect(isFunction(isAnonymousFunc)).toBe(true);
    expect(isFunction(isFunc)).toBe(true);
    expect(isFunction(isClass)).toBe(true);
  });

  test(`should return false if it's not a function`, () => {
    expect(isFunction({})).toBe(false);
    expect(isFunction('string')).toBe(false);
    expect(isFunction(['array'])).toBe(false);
  });
});