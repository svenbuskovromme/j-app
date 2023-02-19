module.exports = {
  "presets": ['module:metro-react-native-babel-preset'],
  "plugins": [
      ["module-resolver", {
        "root": ["./"],
        "extensions": [".ts", ".ios.js", ".android.js", ".js", ".json", ".tsx", ".jsx"],
      }],
      'react-native-reanimated/plugin'
  ],
}
