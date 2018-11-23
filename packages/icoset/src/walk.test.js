const path = require('path')
const walk = require('./walk');

describe('walk', () => {
  test('should look shallowly for icons', async () => {
    let result = await walk({ directory: path.resolve('icons') });
    expect(result.length).toEqual(4);
    result = await walk({ directory: path.resolve('icons/light') });
    expect(result.length).toEqual(1);
  });

  test('should look deeply for icons', async () => {
    let result = await walk({ directory: path.resolve('icons'), deepFind: true });
    expect(result.length).toEqual(6);
  });

  test('should output id and path for each icon', async () => {
    const result = await walk({ directory: path.resolve('icons'), deepFind: true });
    expect(Object.keys(result[0])).toEqual(['path', 'name']);
    const svg = result.find(icon => icon.name === 'emoticon-tongue');
    expect(svg.path).toEqual(`${path.resolve('icons/light')}/${svg.name}.svg`);
  });

  test('"options.icons" should limit results', async () => {
    const result = await walk({ directory: path.resolve('./', 'icons'), deepFind: true, icons: ['image-filter'] });
    expect(result.length).toEqual(1);
    expect(result[0].name).toEqual('image-filter')
  });

  test('name option should interpolate icon name correctly', async () => {
    let result = await walk({
      directory: path.resolve('./', 'icons'),
      deepFind: true,
      icons: ['shield-key'],
    });
    expect(result[0].name).toEqual('shield-key');
    result = await walk({
      directory: path.resolve('./', 'icons'),
      deepFind: true,
      icons: ['shield-key'],
      namePrependDirectory: true,
    });
    expect(result[0].name).toEqual('light-fancy-shield-key');
  });

});