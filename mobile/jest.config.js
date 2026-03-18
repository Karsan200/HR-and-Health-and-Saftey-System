module.exports = {
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'App.tsx',
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!App.tsx",
    "!src/**/index.{js,ts}",
    "!src/**/*.d.ts"
  ],
  coverageThreshold: {
    global: {
      lines: 90,
      functions: 90,
      branches: 90,
      statements: 90
    }
  },
  projects: [
    {
      displayName: 'Rent-A-Tech HR',
      preset: 'react-native',
      testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}'],
      transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|react-native-paper|react-native-paper-dates|react-native-image-picker|react-native-vector-icons|@react-navigation|color|color-string|color-name|color-convert|simple-swizzle|is-arrayish)/)',
        'node_modules/react-native-paper-dates/node_modules/(?!(color|color-string|color-name|color-convert|simple-swizzle|is-arrayish)/)',
      ],
    },
  ],
};
