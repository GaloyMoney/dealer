const path = require("path")
const fs = require("fs")
const webpack = require("webpack")

require("./src/store/env-check")

const isDev = process.env.NODE_ENV !== "production"

const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const config = {
  devtool: isDev ? "inline-source-map" : false,
  resolve: {
    modules: [path.resolve("./src"), path.resolve("./node_modules")],
    extensions: [".ts", ".tsx", ".js", ".json"],
    fallback: {
      stream: require.resolve("stream-browserify"),
      url: require.resolve("url"),
    },
  },
  entry: {
    main: ["./src/renderers/dom.tsx"],
  },
  output: {
    path: path.resolve("public", "bundles"),
    filename: isDev ? "[name].js" : "[name].[chunkhash].js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: { configFile: "tsconfig.fe.json" },
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader?url=false",
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
          },
        ],
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all",
        },
      },
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
    new MiniCssExtractPlugin({
      filename: isDev ? "[name].css" : "[name].[fullhash].css",
      chunkFilename: isDev ? "[id].css" : "[id].[fullhash].css",
    }),
    function (compiler) {
      compiler.hooks.done.tap("gvars", (stats) => {
        let gVars = {}
        try {
          gVars = require("./.gvars.json")
        } catch (err) {
          // do nothing
        }
        fs.writeFileSync(
          path.resolve(".gvars.json"),
          JSON.stringify(
            Object.assign({}, gVars, stats.toJson()["assetsByChunkName"]),
            null,
            2,
          ),
        )
      })
    },
  ],
}

module.exports = config
