/**
 * jest.config.ts
 * Konfigurasi Jest untuk unit testing.
 *
 * Setup untuk testing:
 * - TypeScript via ts-jest
 * - jsdom environment untuk simulasi browser
 * - Path alias @/* sesuai tsconfig
 */

import type { Config } from "jest";

const config: Config = {
  // Gunakan ts-jest untuk compile TypeScript saat testing
  preset: "ts-jest",

  // jsdom mensimulasikan browser environment (diperlukan untuk React testing)
  testEnvironment: "jsdom",

  // Setup file yang dijalankan setelah test environment di-load
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Map path alias @/* ke direktori root (sesuai tsconfig.json)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Pattern file yang dijalankan sebagai test
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],

  // Exclude node_modules
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],

  // Transformasi file TypeScript
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: {
        jsx: "react-jsx",
      },
    }],
  },
};

export default config;
