import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 他の設定があればここに追記
  output: 'standalone',
  webpack(config, { dev }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            // 開発時のHMR問題を回避するため、開発時はmemoを無効化
            memo: !dev,
            // SVGの dimensions 属性を保持（レスポンシブ対応）
            dimensions: false,
            // SVG最適化設定（シンプル・安定重視）
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      // viewBox属性を保持（スケーリング重要）
                      removeViewBox: false,
                      // 開発時は最適化を緩める（安定性優先）
                      ...(dev && {
                        removeUnknownsAndDefaults: false,
                        removeUselessStrokeAndFill: false,
                      }),
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    });

    // 開発時のチャンク分割を制御（HMR安定化）
    if (dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'async',
          cacheGroups: {
            default: false,
            vendors: false,
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;