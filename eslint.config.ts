import { globalIgnores, defineConfig } from 'eslint/config'
import { Linter } from 'eslint'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import globals from 'globals'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

const config: Linter.Config[] = defineConfig(
  // 通用
  {
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      eslintConfigPrettier,
    ],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
    },
    rules: {
      'eol-last': ['error', 'always'],
    },
  },

  // frontend
  {
    files: [
      'apps/frontend/**/*.{ts,js,tsx,jsx,vue}',
      'packages/components/**/*.{ts,js,tsx,jsx,vue}',
    ],
    extends: [pluginVue.configs['flat/essential']],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
      },
    },
  },

  // backend
  {
    files: ['apps/backend/**/*.{ts,js}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    '**/node_modules/**',
    'scripts/**',
    '**/*.d.ts',
  ])
)

export default config
