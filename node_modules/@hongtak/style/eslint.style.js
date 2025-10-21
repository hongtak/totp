import nodePlugin from 'eslint-plugin-n'
import stylistic from '@stylistic/eslint-plugin'

import { rules } from './rules.js'

export default [
  nodePlugin.configs['flat/recommended-module'],
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: rules
  }
]
