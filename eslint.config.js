import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  /* `src/rendr-web/media/mp4box.js` is the GPAC project's demuxer
     (BSD-3-Clause), 11,853 lines of third-party code, vendored rather than
     depended on. It is ignored for that reason alone — the rest of
     `src/rendr-web/` is ours and IS linted. */
  globalIgnores([
    'dist',
    'src/rendr-web/media/mp4box.js',

    /* `.project-details/` IS reached by `eslint .` — it is not skipped for being
       a dot-directory, which is worth knowing before assuming anything in there
       is unlinted. Two kinds of thing live under it and they are treated
       differently on purpose:

       - **Vendored snapshots** (`v0/code/`, `v0/old-article/engine/`, and every
         copy of `mp4box.js`) are verbatim source copied from elsewhere and
         explicitly never edited. Linting a snapshot you have decided not to
         change is pure noise.
       - **Everything else** — `v2/live-demos/` — is ours and IS linted. */
    '.project-details/**/mp4box.js',
    '.project-details/rendr/v0/code/**',
    '.project-details/rendr/v0/old-article/engine/**',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
