const path = require('path');
const { getExternal } = require('../webpack-helper');
const TSDocgenPlugin = require('react-docgen-typescript-webpack-plugin');
module.exports = (baseConfig, env, defaultConfig) => {
  defaultConfig.module.rules.push({
    test: /\.(ts|tsx)$/,
    include: path.resolve(__dirname, '../src'),
      use: [require.resolve('awesome-typescript-loader'), require.resolve("react-docgen-typescript-loader")]
  });
  defaultConfig.plugins.push(new TSDocgenPlugin());
  // defaultConfig.externals = getExternal(['ss-tree']);
  defaultConfig.resolve.extensions.push('.ts', '.tsx');
  return defaultConfig;
};
