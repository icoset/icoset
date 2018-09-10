const getConfig = require('./get-config');
const mock = require('mock-fs');

describe('Get Config', function () {


  test('if config path is not defined, check if "icoset.config.js" exists and use that', async () => {
    global.appRoot = '../test';
    const res = await getConfig({});
    expect(res.configPath).toEqual(`${global.appRoot}/icoset.config.js`);
  });

  test(`if svgPath is defined, don't set configPath (force zero-config)`, async () => {
    global.appRoot = '../test';
    const res = await getConfig({ svgPath: './'});
    expect(res.configPath).toEqual(undefined);
  });

  test(`if config file is not a .js or .json file, throw error`, async () => {
    global.appRoot = '../test';
    let error;
    try {
      await getConfig({ configPath: './index.html' });
    } catch (e) {
      error = e;
    }
    expect(error.message).toEqual('Config file must be a *.json or *.js file type');
  });

  test(`if configPath is not defined and "icoset.config.js doesn't exist in root, throw error"`, async () => {
    global.appRoot = '..';
    let error;
    try {
      await getConfig({});
    } catch (e) {
      error = e;
    }
    expect(error.message).toEqual('No config! Try adding a config file (icoset.config.js) to the root of your app.');
  });

});