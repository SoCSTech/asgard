/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    output: "standalone",
    async rewrites() {
        return [
            {
                source: '/v2/:path*',
                destination: 'http://localhost:3000/v2/:path*',
            },
        ]
    },
};

export default config;
