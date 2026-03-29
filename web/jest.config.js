export default {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.(ts|tsx)$": ["ts-jest", {
            tsconfig: {
                jsx: "react-jsx",
                esModuleInterop: true,
                types: ["jest", "@testing-library/jest-dom", "node"]
            }
        }]
    },
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
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