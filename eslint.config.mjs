import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['app/types/database.types.ts']
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      'vue/define-macros-order': ['error', {
        order: ['defineProps', 'defineEmits', 'defineSlots']
      }],
      'vue/no-unused-refs': 'error',
      'vue/prefer-define-options': 'error',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off'
    }
  }
)
