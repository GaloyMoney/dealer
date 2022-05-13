module.exports = {
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  modulePaths: ["<rootDir>/src"],
  setupFilesAfterEnv: ["<rootDir>/src/jest/setupTests.ts"],
  testEnvironment: "<rootDir>/src/jest/custom-env.ts",
  testPathIgnorePatterns: ["/node_modules/"],
}
