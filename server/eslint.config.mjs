import { defineConfig } from "eslint/config";
import jsdoc from "eslint-plugin-jsdoc";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default defineConfig([
	{ ignores: ["dist/**", "src/generated/prisma/**"] },
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: "latest",
			sourceType: "module"
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
			jsdoc
		},
		rules: {
			"jsdoc/require-jsdoc": [
				"error",
				{
					require: {
						FunctionDeclaration: true,
						MethodDefinition: true,
						ClassDeclaration: true,
						ArrowFunctionExpression: true,
						FunctionExpression: true
					}
				}
			],
			"jsdoc/require-param": "error",
			"jsdoc/require-returns": "error",
			"jsdoc/require-description": "error"
		}
	}
]);
