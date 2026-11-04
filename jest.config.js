module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['./jest.setup.js'],
  // The RN preset only transforms js|ts|tsx; add jsx so .jsx sources are babel-transformed.
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$':
      '<rootDir>/node_modules/@react-native/jest-preset/jest/assetFileTransformer.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage|@react-navigation|react-native-gifted-charts|gifted-charts-core|react-native-svg|react-native-linear-gradient|react-native-image-picker)/)',
  ],
};
