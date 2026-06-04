import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import ts from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	...ts.configs.recommended,
	prettier,
	globalIgnores(["*.user.js", "dist/"]),
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			"@typescript-eslint/no-explicit-any": ["off"],
			"@typescript-eslint/no-this-alias": ["off"]
		},
	},
];
