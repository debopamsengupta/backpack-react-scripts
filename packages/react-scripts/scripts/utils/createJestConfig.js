// @remove-file-on-eject
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const fs = require('fs');
const chalk = require('chalk');
const paths = require('../../config/paths');

const pkgJson = require(paths.appPackageJson);
const bpkReactScriptsConfig = pkgJson['backpack-react-scripts'] || {};

const includePrefixes = bpkReactScriptsConfig.babelIncludePrefixes || [];
includePrefixes.unshift('bpk-');

const transformIgnorePattern = `[/\\\\]node_modules[/\\\\](?!${includePrefixes.join(
  '|'
)}).+\\.(js|jsx|mjs)$`;

module.exports = (resolve, rootDir, isEjecting) => {
  // Use this instead of `paths.testsSetup` to avoid putting
  // an absolute filename into configuration after ejecting.
  const setupTestsFile = fs.existsSync(paths.testsSetup)
    ? '<rootDir>/src/setupTests.js'
    : undefined;

  // TODO: I don't know if it's safe or not to just use / as path separator
  // in Jest configs. We need help from somebody with Windows to determine this.
  const config = {
    collectCoverageFrom: ['src/**/*.{js,jsx,mjs}'],
    setupFiles: [resolve('config/polyfills.js')],
    setupTestFrameworkScriptFile: setupTestsFile,
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.{js,jsx,mjs}',
      '<rootDir>/src/**/?(*.)(spec|test).{js,jsx,mjs}',
    ],
    testEnvironment: 'node',
    testURL: 'http://localhost',
    transform: {
      '^.+\\.(js|jsx|mjs)$': isEjecting
        ? '<rootDir>/node_modules/babel-jest'
        : resolve('config/jest/babelTransform.js'),
      '^.+\\.s?css$': resolve('config/jest/cssTransform.js'),
      '^(?!.*\\.(js|jsx|mjs|css|scss|json)$)': resolve(
        'config/jest/fileTransform.js'
      ),
    },
    transformIgnorePatterns: [transformIgnorePattern],
    moduleNameMapper: {
      '^react-native$': 'react-native-web',
      '^.+\\.s?css$': 'identity-obj-proxy',
    },
    moduleFileExtensions: [
      'web.js',
      'mjs',
      'js',
      'json',
      'web.jsx',
      'jsx',
      'node',
    ],
  };
  if (rootDir) {
    config.rootDir = rootDir;
  }
  const overrides = Object.assign({}, require(paths.appPackageJson).jest);
  const supportedKeys = [
    'collectCoverageFrom',
    'coverageReporters',
    'coverageThreshold',
    'snapshotSerializers',
  ];
  if (overrides) {
    supportedKeys.forEach(key => {
      if (overrides.hasOwnProperty(key)) {
        config[key] = overrides[key];
        delete overrides[key];
      }
    });
    const unsupportedKeys = Object.keys(overrides);
    if (unsupportedKeys.length) {
      console.error(
        chalk.red(
          'Out of the box, Create React App only supports overriding ' +
            'these Jest options:\n\n' +
            supportedKeys.map(key => chalk.bold('  \u2022 ' + key)).join('\n') +
            '.\n\n' +
            'These options in your package.json Jest configuration ' +
            'are not currently supported by Create React App:\n\n' +
            unsupportedKeys
              .map(key => chalk.bold('  \u2022 ' + key))
              .join('\n') +
            '\n\nIf you wish to override other Jest options, you need to ' +
            'eject from the default setup. You can do so by running ' +
            chalk.bold('npm run eject') +
            ' but remember that this is a one-way operation. ' +
            'You may also file an issue with Create React App to discuss ' +
            'supporting more options out of the box.\n'
        )
      );
      process.exit(1);
    }
  }
  return config;
};
