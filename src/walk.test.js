const path = require('path')
const walk = require('./walk');

const sortName = (a, b) => {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
}

describe('walk', () => {
  test('should find all deeply nested icons', (done) => {
    walk(path.resolve('./', 'svgs'), (err, result) => {
      expect(result.length).toEqual(6);
      done();
    });
  });

  test('should output name and path for each icon', (done) => {
    walk(path.resolve('./', 'svgs'), (err, result) => {
      result.sort(sortName);
      expect(Object.keys(result[0])).toEqual(['name', 'path']);
      expect(result[0].name).toEqual('500px.svg');
      done();
    });
  });

  test('"preserveFolderNames" should preserve folder names in svg names', (done) => {
    walk(path.resolve('./', 'svgs'), (err, result) => {
      result.sort(sortName);
      expect(result[3].name).toEqual('light-fancy-wine-glass.svg');
      done();
    }, true);
  });
});