//========================搭建服务器并配置=================
const express = require("express"); //加载express 资源
const logger = require("morgan"); //日志模块
const favicon = require("serve-favicon"); //小图标
const path = require("path");

// 引入处理post数据的模块

// const bodyParser=require("body-parser");

//引入cookie和session模块
const session = require("express-session");
const cookieParser = require("cookie-parser");

//引入自己的路由模块

const route = require("./routes/indexRouter");

const app = express(); //执行express 全局函数，返回一个express服务器对象
//---express 配置

//2.日志模块：记录每次请求信息，并在调试台看到
app.use(logger("dev")); //调用日志，配置为dev模式

//===========cookie配置=============
app.use(cookieParser());
app.use(
  session({
    name: "demo223",
    secret: "123123123", //秘钥
    resave: true, //是否更新session-cookie的失效时间
    saveUninitialized: true, //未初始化cookie要不要保存，无论有没有设置session cookie,每次请求都设置个 session cookie
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30, //cookie有效时间，单位是毫秒

      rolling: true, //更新保存，按照原设定的maxAge值重新设定session同步到cookie中
    },
  })
);

/*==========================ejs配置============================*/
//npm install ejs --save
app.set("views", path.join(__dirname, "views")); //视图文件路径

//视图解析引擎
app.set("view engine", "ejs");

//使用处理post请求的模块
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//设置允许跨域访问该服务.
app.all("", function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Content-Type", "application/json;charset=utf-8");

  next();
});

// 允许所有跨域
app.all("*", function (req, res, next) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", "*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers", "content-type");
  //跨域允许的请求方式
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == "options") res.send(200);
  //让options尝试请求快速结束
  else next();
});

//使用自己定义路由模块
app.use(route);

//1.设置静态资源路径
app.use(express.static("./dist")); //__dirname 指向当前文件的根目录
// app.use(express.static(__dirname + "/public/html")); //__dirname 指向当前文件的根目录

// app.use(favicon(__dirname + "/public/images/favicon.ico"));

app.set("port", 8888); //设置端口
app.listen(8888, () => {
  console.log("服务器已启动" + app.get("port"));
});
