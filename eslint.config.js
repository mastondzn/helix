import { maston } from '@mastondzn/eslint';

// run pnpx @eslint/config-inspector to see what this adds
export default maston(
    {
        typescript: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
        },
    },
    {
        rules: { 'ts/no-empty-object-type': 'off' },
    },
);
