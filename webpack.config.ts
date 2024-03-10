import { resolve } from 'path';
import CopyPlugin from 'copy-webpack-plugin'; // eslint-disable-line import/default
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { DefinePlugin } from 'webpack';
import { GenerateSW } from 'workbox-webpack-plugin';
import type { Configuration as WebpackConfiguration } from 'webpack';
import type { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const NODE_ENV =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';
const distPath = resolve(__dirname, 'dist');

const config: Configuration = {
  mode: NODE_ENV,
  entry: resolve(__dirname, 'src', 'index.tsx'),
  output: {
    path: distPath,
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader'
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              svgo: {
                plugins: [{ removeViewBox: false }]
              }
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: {
                  tailwindcss: {},
                  autoprefixer: {},
                  ...(NODE_ENV === 'production' ? { cssnano: {} } : {})
                }
              }
            }
          }
        ]
      },
      {
        test: /\.ya?ml$/,
        use: 'yaml-loader'
      },
      {
        test: /\.wasm$/,
        type: 'webassembly/async'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  devServer: {
    allowedHosts: 'all', // Allow access from all hosts
    // Other possible devServer configurations...
    static: {
      directory: resolve(__dirname, 'dist')
    },
    // client: {
    //   logging: 'info',
    //   overlay: true, // Show compilation errors in the browser overlay
    // },
    // open: true, // Open the browser after the server starts
    compress: true // Enable gzip compression
    // historyApiFallback: true // Fallback to index.html for Single Page Applications
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, 'src', 'index.html')
    }),
    new MiniCssExtractPlugin(),
    new CopyPlugin({ patterns: ['resources'] }),
    ...(NODE_ENV === 'production'
      ? [
          new GenerateSW({
            swDest: resolve(distPath, 'sw.js'),
            skipWaiting: true,
            clientsClaim: true,
            cleanupOutdatedCaches: true
          })
        ]
      : []),
    new DefinePlugin({
      COMMIT_HASH: JSON.stringify('DOCKER_TEST')
    })
  ],
  devtool: NODE_ENV === 'development' ? 'inline-source-map' : false,
  experiments: {
    asyncWebAssembly: true,
    topLevelAwait: true
  }
};
export default config;
