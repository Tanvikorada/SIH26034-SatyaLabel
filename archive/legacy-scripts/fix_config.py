with open('frontend/next.config.ts', 'r', encoding='utf-8') as f:
    config = f.read()

config = config.replace('const nextConfig: NextConfig = {\n  eslint: {\n    ignoreDuringBuilds: true,\n  },', 'const nextConfig: NextConfig = {')

with open('frontend/next.config.ts', 'w', encoding='utf-8') as f:
    f.write(config)
