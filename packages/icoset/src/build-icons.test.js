const buildIcons = require('./build-icons');
const path = require('path');

describe('buildIcons', function () {
  test(`should generate an svg and viewBoxMap`, async () => {
    const results = await buildIcons([
      [
        { name: '500px', path: path.resolve('svgs/brands/500px.svg') },
      ],
      [
        { name: 'angry', path: path.resolve('svgs/brands/angry.svg') },
      ]
    ]);
    expect(results.svg.includes('id="500px"')).toBe(true)
    expect(results.svg.includes('id="angry"')).toBe(true)
    expect(results.viewBoxMap).toEqual({ '500px' : { viewBox: '' }, angry: { viewBox: '0 0 496 512' } })
  });
});