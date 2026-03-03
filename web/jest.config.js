export default {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    globals: {
        "ts-jest": {
            tsconfig: {
                jsx: "react-jsx",
                esModuleInterop: true
            }
        }
    },
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        'src/App.tsx',
        'src/main.tsx',
    ],
    collectCoverageFrom: [
        "src/**/*.{ts,tsx}",
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
};