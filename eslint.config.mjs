import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

const sharedRules = {
	// Styl / czytelność
	indent: ["error", "tab", { SwitchCase: 1 }],
	semi: ["error", "always"],
	"comma-dangle": ["warn", "always-multiline"],

	// Potencjalne błędy / higiena
	"no-unused-vars": ["warn", {
		args: "after-used",
		argsIgnorePattern: "^_",
		varsIgnorePattern: "^_",
		caughtErrorsIgnorePattern: "^_",
	}],
	"no-undef": "error",
	"no-var": "error",
	// "prefer-const": ["error", { destructuring: "all" }],
};

export default defineConfig([
	{
		files: ["**/*.js"],
		plugins: {
			js,
		},
		extends: ["js/recommended"],
		rules: {
			...sharedRules,
		},
		languageOptions: {
			ecmaVersion: 2017, // 8 – ES2017 (async), 10 – ES2019 (flat), 11 – ES2020 (?., ??)
			sourceType: "commonjs",
			globals: {
				...globals.browser,
				// mw: "readonly",
			},
		},
	},
	{
		files: ["**/*.mjs"],
		plugins: {
			js,
		},
		extends: ["js/recommended"],
		rules: {
			...sharedRules,
			"no-trailing-spaces": "warn",
		},
		languageOptions: {
			ecmaVersion: 12, // 8 – ES2017 (async), 10 – ES2019 (flat), 11 – ES2020 (?., ??)
			sourceType: "module",
			globals: {
				...globals.node,
				//...globals.mocha,
				// I18n: "readonly",
				// IsbnTools: "readonly",
			},
		},
	},
]);