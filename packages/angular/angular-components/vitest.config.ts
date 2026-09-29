import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
//
// No `storybookAngularVitest` plugin here (unlike the React kit) — that plugin ships only with
// `@storybook/angular-vite`, which requires Angular 21+ (checked against npm's published peer
// deps when this skeleton was set up; incompatible with this project's Angular 19). This workspace
// uses the classic `@storybook/angular` (webpack5) framework instead, which has no Vite-plugin
// equivalent to forward Angular build options into vitest — revisit once the vite framework
// supports Angular 19, or drop this note if a later Angular upgrade adopts it.
export default defineConfig({
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});