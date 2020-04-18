const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
var fs = require("fs");
const cwd = process.cwd();
const webpackFile = path.join(cwd + "/webpack.config.js");

let webpackConfig = {};
if (fs.existsSync(webpackFile)) {
  webpackConfig = require(webpackFile);
}
const { resolve: aliasResolve = {} } = webpackConfig;
const { alias = {} } = aliasResolve;
const resolve = (resource) => {
  return path.join(cwd, "public/lib", resource);
};

const config = {
  mode: "development",
  entry: {},
  devtool: "source-map",
  output: {
    filename: "[name].min.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    chrome: "58",
                    ie: "11",
                  },
                },
              ],
            ],
            plugins: [["@babel/plugin-transform-runtime"]],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "less-loader",
          },
        ],
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
        loader: "url-loader",
      },
    ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // Must be set to true if using source-maps in production
        terserOptions: {
          // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
        },
      }),
    ],
  },
  resolve: {
    alias: {
      jquery: resolve("core/jquery-1.10.2.min"),
      es5: resolve("core/es5"),
      cnzz: resolve("util/util.cnzz"),
      util: resolve("util/util.bmw"),
      waves: resolve("widget/waves.js"),
      layer: resolve("widget/layer/layer.js"),
      layerCss: resolve("widget/layer/theme/default/layer.css"),
      flexible: resolve("widget/flexible.js"),
      fileinputJs: resolve(
        "widget/bootstrap/bootstrap-fileinput/js/fileinput.js"
      ),
      fileinputCss: resolve(
        "widget/bootstrap/bootstrap-fileinput/css/fileinput.min.css"
      ),
      datetimeCss: resolve(
        "widget/bootstrap/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css"
      ),
      datetimeJs: resolve(
        "widget/bootstrap/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js"
      ),
      datetimeCN: resolve(
        "widget/bootstrap/bootstrap-datetimepicker/js/bootstrap-datetimepicker.zh-CN.js"
      ),
      jQTableJs: resolve("widget/jquery-table/jquery.dataTables.min.js"),
      jQBootTableJs: resolve("widget/jquery-table/dataTables.bootstrap.min.js"),
      jQBootTableCss: resolve(
        "widget/jquery-table/dataTables.bootstrap.min.css"
      ),
      ...alias,
    },
  },
};
module.exports = config;
