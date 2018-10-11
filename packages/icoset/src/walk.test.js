const path = require('path')
const walk = require('./walk');

describe('walk', () => {
  test('should look shallowly for icons', async () => {
    let result = await walk({ directory: path.resolve('svgs') });
    expect(result.length).toEqual(0);
    result = await walk({ directory: path.resolve('./', 'icons') });
    expect(result.length).toEqual(194);
  });

  test('should look deeply for icons', async () => {
    let result = await walk({ directory: path.resolve('svgs'), deepFind: true });
    expect(result.length).toEqual(6);
  });

  test('should output id and path for each icon', async () => {
    const result = await walk({ directory: path.resolve('./', 'svgs'), deepFind: true });
    expect(Object.keys(result[0])).toEqual(['path', 'name']);
    const svg = result.find(icon => icon.name === '500px');
    expect(svg.path).toEqual(`${path.resolve('svgs/brands')}/${svg.name}.svg`);
  });

  test('"options.icons" should limit results', async () => {
    const result = await walk({ directory: path.resolve('./', 'svgs'), deepFind: true, icons: ['500px'] });
    expect(result.length).toEqual(1);
    expect(result[0].name).toEqual('500px')
  });

  test('name option should interpolate icon name correctly', async () => {
    let result = await walk({
      directory: path.resolve('./', 'svgs'),
      deepFind: true,
      icons: ['wine-glass'],
    });
    expect(result[0].name).toEqual('wine-glass');
    result = await walk({
      directory: path.resolve('./', 'svgs'),
      deepFind: true,
      icons: ['wine-glass'],
      namePrependDirectory: true,
    });
    expect(result[0].name).toEqual('light-fancy-wine-glass');
  });

});