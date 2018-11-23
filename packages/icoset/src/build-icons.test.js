const buildIcons = require('./build-icons');
const path = require('path');

describe('buildIcons', function () {
  test(`should generate an svg and viewBoxMap`, async () => {
    const results = await buildIcons([
      [{ name: 'emoticon-tongue', path: path.resolve('icons/light/emoticon-tongue.svg') }],
      [{ name: 'shield-key', path: path.resolve('icons/light/fancy/shield-key.svg') }],
    ]);
    expect(results.svg.includes('id="emoticon-tongue"')).toBe(true)
    expect(results.svg.includes('id="shield-key"')).toBe(true)
    expect(results.viewBoxMap).toEqual({ 'emoticon-tongue' : { viewBox: '0 0 24 24' }, 'shield-key': { viewBox: '0 0 24 24' } })
  });
});