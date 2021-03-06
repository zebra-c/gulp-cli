const { watch, src, dest } = require("gulp");
const path = require("path");
const chalk = require("chalk");
const htmlmin = require("gulp-htmlmin");
const gulpwebpack = require("webpack-stream");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const less = require("gulp-less");
const program = require("commander");
const cleanCSS = require("gulp-clean-css");
const plumber = require("gulp-plumber");
const autoprefixer = require("gulp-autoprefixer");
const moment = require("moment");
const webpackConfig = require("./webpack.config");

const cwd = process.cwd();
const log = console.log;

function commaSeparatedList(value) {
  return value.split(",");
}
program
  .option("-F, --folder <items>", "设置监听文件夹", commaSeparatedList)
  .option("-M, --mode [type]", "设置环境变量");

program.parse(process.argv);
const folder = program.folder;
const mode = program.mode || "production";

if (!folder) {
  log(chalk.red("请指定监听文件名，格式: gulp watch -F www,admin"));
  process.exit(0);
}
const watchPath = folder.map((item) => {
  return path.join(cwd, "resources/assets", item, "**").replace(/\\/g, "/");
});

process.on("unhandledRejection", (reason, p) => {
  log("Unhandled Rejection at: Promise", p, "reason:", reason);
});

function compilehtml(fileName) {
  var from = fileName.replace(/\\/g, "/");
  var to = path
    .dirname(from)
    .replace("/assets/", "/views/")
    .replace("/html/", "/");
  const compiler = () => {
    const options = {
      removeComments: true, //清除HTML注释
      collapseWhitespace: true, //压缩HTML
      removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
      minifyJS: true,
      minifyCSS: true,
    };

    src(from, {
      allowEmpty: true,
    })
      .pipe(htmlmin(options))
      .pipe(
        rename(function (path) {
          path.extname = ".blade.php";
        })
      )
      .pipe(replace(/\.js/gi, ".js?_=" + moment().format("YYYYMMDDHHmmss")))
      .pipe(replace(/\.css/gi, ".css?_=" + moment().format("YYYYMMDDHHmmss")))
      .pipe(dest(to));
    log(chalk.green("html-success!"));
  };
  compiler();
}
function compilecss(fileName) {
  const from = fileName.replace(/\\/g, "/");
  const to = path
    .dirname(from)
    .replace("resources/assets", "public")
    .replace("/less/", "/css/");
  console.log(from, to);
  const compiler = () => {
    src(from)
      .pipe(plumber())
      .pipe(less())
      .pipe(
        autoprefixer({
          browsers: ["last 2 versions"],
          cascade: true,
        })
      )
      .pipe(cleanCSS())
      .pipe(dest(to));
    log(chalk.green("css-success!"));
  };
  compiler();
}
async function compilejs(fileName) {
  webpackConfig.entry = Object.create(null);
  webpackConfig.mode = mode;
  var from = fileName.replace(/\\/g, "/");
  if (from.indexOf("/mod-js/") > -1) {
    log(
      chalk.yellow(
        "************************不打包mod-js下的文件************************"
      )
    );
    return;
  }
  var to = path.dirname(from).replace("resources/assets", "public");
  var fileName = path.basename(from, ".js");
  webpackConfig.entry[fileName] = from;
  const compiler = () => {
    src(from)
      .pipe(
        gulpwebpack({
          config: webpackConfig,
        })
      )
      .pipe(dest(to + "/"));
    log(chalk.green("js-success!"));
  };
  compiler();
}

const handlerCompireMaps = {
  ".less": compilecss,
  ".css": compilecss,
  ".js": compilejs,
  ".html": compilehtml,
};
function watchSource() {
  watch(watchPath).on("change", function (fileName) {
    const ext = path.extname(fileName);
    const handler = handlerCompireMaps[ext];
    if (!handler) {
      log(chalk.red("只监听 .less .css .js .html 后缀文件!"));
      return;
    }
    handler(fileName);
  });
}

// exports.watch = series(selfGulp);
module.exports = function () {
  watchSource();
};
