module.exports = {
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/src/web/App.tsx',
    '/src/mobile/App.tsx'
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/App.tsx",
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
      displayName: 'web',
      testMatch: ['**/__tests__/**/*.web.test.{js,jsx,ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.web.js'],
      transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
    },
    {
      displayName: 'mobile',
      preset: 'react-native',
      testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}', '!**/__tests__/**/*.web.test.{js,jsx,ts,tsx}'],
    },
  ],
};
