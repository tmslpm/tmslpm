import path from "path";
import webpack from 'webpack';
import CopyPlugin from "copy-webpack-plugin";

const config: webpack.Configuration = {
  mode: "development",

  entry: "./src/main.ts",

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  watchOptions: {
    ignored: "**/node_modules",
  },

  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },

  plugins: [
    new CopyPlugin({
      patterns: ["public"],
    }),
  ],

  node: {
    __dirname: true
  }
};

export default config;


