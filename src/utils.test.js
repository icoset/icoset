const path = require('path')
const { walk } = require('./utils');

describe('walk', () => {
  test('should find all deeply nested icons', (done) => {
    walk(path.resolve('./', 'svgs'), (err, result) => {
      expect(result.length).toEqual(3982);
      done();
    });
  });

  test('should output name and path for each icon', (done) => {
    walk(path.resolve('./', 'svgs'), (err, result) => {
      expect(Object.keys(result[0])).toEqual(['name', 'path']);
      done();
    });
  });
});