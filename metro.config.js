/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

  const path = require('path');

  const { getDefaultConfig } = require('metro-config');

  // const extraNodeModules = {
  //   'jungle-shared': path.resolve(__dirname + '/../jungle-shared/'),
  // };
  // const watchFolders = [
  //   path.resolve(__dirname + '/../jungle-shared')
  // ];

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      // extraNodeModules,
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
    },
    // watchFolders
  }
})();
