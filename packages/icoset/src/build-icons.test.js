const buildIcons = require('./build-icons');
const path = require('path');

describe('buildIcons', function () {
  test(`should generate svgs`, async () => {
    const results = await buildIcons([
      [{ name: 'emoticon-tongue', path: path.resolve('icons/light/emoticon-tongue.svg') }],
      [{ name: 'shield-key', path: path.resolve('icons/light/fancy/shield-key.svg') }],
    ]);
    expect(results.includes('id="emoticon-tongue"')).toBe(true)
    expect(results.includes('id="shield-key"')).toBe(true)
  });
});
