module.exports = {
  preset: 'react-native',
  collectCoverageFrom: [
      "src/**/*.{js,jsx,ts,tsx}",
      "!src//**/index.{js,ts}",
      "!src/**/*.d.ts"
  ],
  coverageThreshold: {
    global: {
      lines: 90,
      functions: 90,
      branches: 90,
      statements: 90
    }
  }
};
