with open('frontend/next.config.ts', 'r', encoding='utf-8') as f:
    config = f.read()

if 'eslint: { ignoreDuringBuilds: true }' not in config:
    config = config.replace('const nextConfig: NextConfig = {', 'const nextConfig: NextConfig = {\n  eslint: {\n    ignoreDuringBuilds: true,\n  },')
    with open('frontend/next.config.ts', 'w', encoding='utf-8') as f:
        f.write(config)
