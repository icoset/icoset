#!/usr/bin/env node
const path = require('path');
global.appRoot = path.resolve(__dirname);
require('./src/icoset');