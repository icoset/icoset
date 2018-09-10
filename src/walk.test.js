const path = require('path')
const walk = require('./walk');

const sortName = (a, b) => {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
}

describe('walk', () => {
  test('should find all deeply nested icons', async () => {
    const result = await walk(path.resolve('./', 'svgs'));
    expect(result.length).toEqual(6);
  });

  test('should output name and path for each icon', async () => {
    const result = await walk(path.resolve('./', 'svgs'));
    result.sort(sortName);
    expect(Object.keys(result[0])).toEqual(['fullName', 'path', 'name']);
    expect(result[0].name).toEqual('500px');
    expect(result[0].fullName).toEqual('500px.svg');
  });

  test('"iconList" should limit results', async () => {
    const result = await walk(path.resolve('./', 'svgs'), false, ['500px']);
    result.sort(sortName);
    expect(result.length).toEqual(1);
    expect(result[0].name).toEqual('500px')
  });

  test('"preserveFolderNames" should preserve folder names in svg names', async () => {
    const result = await walk(path.resolve('./', 'svgs'), true);
    result.sort(sortName);
    expect(result[5].name).toEqual('wine-glass');
    expect(result[5].fullName).toEqual('light-fancy-wine-glass.svg');
  });

});