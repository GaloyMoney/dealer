const path = require("path")
const fs = require("fs")
const webpack = require("webpack")

const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const config = (env) => ({
  devtool: env.dev ? "inline-source-map" : false,
  resolve: {
    modules: [path.resolve("./src"), "node_modules"],
    extensions: [".ts", ".tsx", ".js", ".json"],
    fallback: {
      events: require.resolve("events/"),
      stream: require.resolve("stream-browserify"),
      url: require.resolve("url"),
    },
  },
  entry: {
    main: ["./src/renderers/dom.tsx"],
  },
  output: {
    path: path.resolve("public", "bundles"),
    filename: env.dev ? "[name].js" : "[name].[chunkhash].js",
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
    new webpack.ProvidePlugin({ Buffer: ["buffer", "Buffer"] }),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(env.dev ? "development" : "production"),
    }),

    new MiniCssExtractPlugin({
      filename: env.dev ? "[name].css" : "[name].[fullhash].css",
      chunkFilename: env.dev ? "[id].css" : "[id].[fullhash].css",
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
})

module.exports = config
