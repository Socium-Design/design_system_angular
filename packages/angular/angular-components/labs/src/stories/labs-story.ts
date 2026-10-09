import { componentWrapperDecorator } from '@storybook/angular';

/**
 * Banner shown above every Labs story (canvas and docs). Labs components can change without any
 * compatibility guarantee until the design team promotes them — the banner makes that explicit to
 * anyone reviewing them in Storybook.
 */
export const labsBanner = componentWrapperDecorator(
  (story) => `
    <div class="flex flex-col gap-[var(--bridges-position-gap-lg)]">
      <p
        role="note"
        class="flex items-center gap-[var(--bridges-position-gap-sm)] rounded-[var(--bridges-shape-figure-radius-md)] border-[length:var(--bridges-shape-figure-border-stroke-default)] border-[var(--bridges-color-accent-amber-text)] bg-[var(--bridges-color-accent-amber-bg)] px-[var(--bridges-position-padding-md)] py-[var(--bridges-position-padding-3xs)] text-[length:var(--bridges-size-text-text-size-sm)] text-[var(--bridges-color-text-warning)] [font-weight:var(--bridges-shape-text-label-weight)]"
      >
        Composant expérimental — non stabilisé
      </p>
      <div>${story}</div>
    </div>
  `,
);
