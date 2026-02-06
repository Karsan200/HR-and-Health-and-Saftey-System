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
      testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}', '!**/__tests__/**/*.web.test.{js,jsx,ts,tsx}'],
    },
  ],
};
