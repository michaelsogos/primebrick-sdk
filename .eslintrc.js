module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        extraFileExtensions: ['.json'],
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: ['plugin:@typescript-eslint/eslint-recommended', 'prettier'],
    root: true,
    env: {
        es6: true,
        node: true,
        jest: true,
    },
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
    },
    ignorePatterns: ['.eslintrc.js', '**/node_modules/*',"*.d.ts"],
};
