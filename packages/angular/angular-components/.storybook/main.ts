import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)', '../labs/**/*.mdx', '../labs/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@chromatic-com/storybook', '@storybook/addon-vitest', '@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  // Angular CLI's own webpack config hardcodes `postcss-loader`'s `postcssOptions` to
  // `{ config: false }` for every .css rule — it deliberately ignores .postcssrc.json, and only
  // wires up Tailwind itself when it finds a tailwind.config.{js,ts,...} file, at which point it
  // does `require('tailwindcss')({ config: ... })` — the Tailwind v3 plugin API, which v4 (what
  // this repo and design_system both use) explicitly refuses to run as a direct PostCSS plugin
  // anymore, throwing instead of silently no-op'ing. Verified both failure modes with
  // `--debug-webpack` before landing on this: replace postcss-loader's options on the existing
  // `.css` rule with our own, rather than adding a tailwind.config.js Angular can't actually use.
  webpackFinal: async (webpackConfig) => {
    const tailwindcss = (await import('@tailwindcss/postcss')).default;
    const cssRule = webpackConfig.module?.rules?.find(
      (rule): rule is Record<string, unknown> =>
        !!rule && typeof rule === 'object' && 'test' in rule && rule.test instanceof RegExp && rule.test.source === '\\.(?:css)$',
    );
    const oneOfEntries = (cssRule?.['rules'] as Array<{ oneOf?: Array<{ use?: Array<Record<string, unknown>> }> }> | undefined)?.[0]
      ?.oneOf;
    for (const entry of oneOfEntries ?? []) {
      for (const use of entry.use ?? []) {
        if (typeof use['loader'] === 'string' && use['loader'].includes('postcss-loader')) {
          const options = use['options'] as Record<string, unknown>;
          options['postcssOptions'] = { plugins: [tailwindcss()] };
        }
      }
    }
    return webpackConfig;
  },
};
export default config;