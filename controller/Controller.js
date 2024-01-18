const dbpool = require("../config/dbpoolconfig");
const getUUID = () => {
  let chars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  let uuid = [],
    i;

  if (5) {
    for (i = 0; i < 5; i++) uuid[i] = chars[0 | (Math.random() * 5)];
  } else {
    var r;

    uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
    uuid[14] = "4";

    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join("");
};

const createJwt = require("jwt-simple");

const checkIsLogin = (token) => {
  if (!token || token === undefined || token === "undefined") {
    return false;
  }
  const { id, expires } = createJwt.decode(token, "wangtt-web");
  let isLogin = true;
  dbpool.connect("select * from user where id = ?", [id], (err, data) => {
    if (!err) {
      const nowDate = +new Date();
      if (expires < nowDate) {
        isLogin = false;
      } else {
        isLogin = true;
      }
    } else {
      isLogin = false;
    }
  });
  return isLogin;
};

const fileController = {
  login(req, res) {
    const { username, password } = req.body;
    dbpool.connect(
      "select * from user where username=? and password=?",
      [username, password],
      (err, data) => {
        if (!err) {
          if (data?.length > 0) {
            const payload = {
              id: data?.[0]?.id,
              expires: new Date().setDate(new Date().getDate() + 1),
            };
            const key = "wangtt-web";
            const jwt = createJwt.encode(payload, key);

            const arr = [
              jwt,
              new Date(),
              new Date(new Date().setDate(new Date().getDate() + 1)),
              username,
            ];
            dbpool.connect(
              "update user set jwt=?, jwtStartTime=?, jwtEndTime=? where username=?",
              arr,
              (upErr, upData) => {
                if (!upErr) {
                  res.send({
                    success: true,
                    data: {
                      username: username,
                      id: data?.[0]?.id,
                      jwt,
                      level: data?.[0]?.level,
                    },
                  });
                }
              }
            );
          }
        }
      }
    );
  },
  getUserList(req, res) {
    const { current, pageSize, username, startTime, endTime } = req.query;
    const { token } = req.headers;
    if (!checkIsLogin(token)) {
      res.status(403).send({
        success: false,
        message: "登录过期，请重新登录！",
      });
    }
    let sql = "select * from user limit ?,?;";
    let arr = [(Number(current) - 1) * pageSize, Number(current) * pageSize];
    if (username && !startTime) {
      sql = `select * from user where username like '%${username}%' limit ?,?;`;
      arr = [(Number(current) - 1) * pageSize, Number(current) * pageSize];
    } else if (startTime && !username) {
      sql = "select * from user where createTime<? and createTime>? limit ?,?;";
      arr = [
        endTime,
        startTime,
        (Number(current) - 1) * pageSize,
        Number(current) * pageSize,
      ];
    } else if (username && startTime) {
      sql = `select * from user where username like '%${username}%' and createTime<? and createTime>?  limit ? , ?;`;
      arr = [
        endTime,
        startTime,
        (Number(current) - 1) * pageSize,
        Number(current) * pageSize,
      ];
    }
    dbpool.connect("select * from user", [], (e, d) => {
      dbpool.connect(sql, arr, (err, data) => {
        if (!err) {
          res.send({
            success: true,
            total: d?.length,
            data,
          });
        } else {
          res.send({
            success: false,
            message: err,
          });
        }
      });
    });
  },
  delUser(req, res) {
    const { id } = req.body;
    const { token } = req.headers;
    if (!checkIsLogin(token)) {
      res.status(403).send({
        success: false,
        message: "登录过期，请重新登录！",
      });
    }
    dbpool.connect("delete from user where id=?", [id], (err, data) => {
      if (!err) {
        res.send({
          success: true,
          message: "删除成功!",
        });
      } else {
        res.send({
          success: false,
          message: err,
        });
      }
    });
  },
  addUser(req, res) {
    const { token } = req.headers;
    if (!checkIsLogin(token)) {
      res.status(403).send({
        success: false,
        message: "登录过期，请重新登录！",
      });
    }
    const { username, password, level } = req.body;
    const arr = [username, password, level, new Date()];
    dbpool.connect(
      "select * from user where username=?",
      [username],
      (err, data) => {
        if (data?.length === 1) {
          res.send({
            success: false,
            message: "用户已存在",
          });
        } else {
          dbpool.connect(
            "insert into user (username, password, level, createTime) values (?,?,?,?);",
            arr,
            (iErr, iData) => {
              if (!iErr) {
                res.send({
                  success: true,
                  message: "创建成功",
                });
              }
            }
          );
        }
      }
    );
  },
  updateUser(req, res) {
    const { token } = req.headers;
    if (!checkIsLogin(token)) {
      res.status(403).send({
        success: false,
        message: "登录过期，请重新登录！",
      });
    }
    const { username, password, level, id } = req.body;
    dbpool.connect("select * from user where id=?", [id], (err, data) => {
      if (data?.length === 1) {
        const arr = [username, password, level, id];
        dbpool.connect(
          "update user set username=?, password=?, level=? where id=?;",
          arr,
          (iErr, iData) => {
            if (!iErr) {
              res.send({
                success: true,
                message: "修改成功",
              });
            }
          }
        );
      } else {
        res.send({
          success: false,
          message: "用户不存在",
        });
      }
    });
  },

  getProductList(req, res) {
    const { current, pageSize, name, price } = req.query;
    const { token } = req.headers;
    if (!checkIsLogin(token)) {
      res.status(403).send({
        success: false,
        message: "登录过期，请重新登录！",
      });
    }

    let sql = "select * from product limit ?,?;";
    let arr = [(Number(current) - 1) * pageSize, Number(current) * pageSize];
    if (name && !price) {
      sql = `select * from product where name like '%${name}%' limit ?,?;`;
      arr = [(Number(current) - 1) * pageSize, Number(current) * pageSize];
    } else if (price && !name) {
      sql = "select * from product where price=? limit ?,?;";
      arr = [
        price,
        (Number(current) - 1) * pageSize,
        Number(current) * pageSize,
      ];
    } else if (name && price) {
      sql = `select * from product where name like '%${name}%' price =?  limit ? , ?;`;
      arr = [
        name,
        price,
        (Number(current) - 1) * pageSize,
        Number(current) * pageSize,
      ];
    }
    dbpool.connect("select * from product", [], (err, d) => {
      dbpool.connect(sql, arr, (err, data) => {
        if (!err) {
          res.send({
            success: true,
            total: d?.length,
            data,
          });
        } else {
          res.send({
            success: false,
            message: err,
          });
        }
      });
    });
  },
  addProduct(req, res) {
    const { token } = req.headers;
    if (!checkIsLogin(token)) {
      res.status(403).send({
        success: false,
        message: "登录过期，请重新登录！",
      });
    }
    const { name, price } = req.body;
    dbpool.connect(
      "insert into product (name, price) values (?,?);",
      [name, price],
      (err, data) => {
        if (!err) {
          res.send({
            success: true,
            message: "新增成功",
          });
        } else {
          res.send({
            success: false,
            message: err,
          });
        }
      }
    );
  },
  updateProduct(req, res) {
    const { token } = req.headers;
    if (!checkIsLogin(token)) {
      res.status(403).send({
        success: false,
        message: "登录过期，请重新登录！",
      });
    }
    const { name, price, id } = req.body;
    dbpool.connect("select * from product where id=?", [id], (err, data) => {
      if (data?.length === 1) {
        const arr = [name, price, id];
        dbpool.connect(
          "update product set name=?, price=? where id=?;",
          arr,
          (iErr, iData) => {
            if (!iErr) {
              res.send({
                success: true,
                message: "修改成功",
              });
            } else {
              res.send({
                success: false,
                message: Err,
              });
            }
          }
        );
      } else {
        res.send({
          success: false,
          message: err,
        });
      }
    });
  },
  deleteProduct(req, res) {
    const { id } = req.params;
    const { token } = req.headers;
    if (!checkIsLogin(token)) {
      res.status(403).send({
        success: false,
        message: "登录过期，请重新登录！",
      });
    }
    dbpool.connect("select * from product where id = ?", [id], (e) => {
      if (!e) {
        dbpool.connect("delete from product where id=?", [id], (err, data) => {
          if (!err) {
            res.send({
              success: true,
              message: "删除成功!",
            });
          } else {
            res.send({
              success: false,
              message: err,
            });
          }
        });
      } else {
        res.send({
          success: false,
          message: "产品不存在",
        });
      }
    });
  },

  getStoreList(req, res) {
    const { token } = req.headers;
    if (!checkIsLogin(token)) {
      res.status(403).send({
        success: false,
        message: "登录过期，请重新登录！",
      });
    }
    const { current, pageSize } = req.query;
    const page = (Number(current) - 1) * pageSize,
      limit = Number(current) * Number(pageSize);
    let sql = `select * from store limit ?,?;`;
    let sqlAll = 'select count(*) as total from store;'
    let arr = [page, limit];
    let arrAll = []
    let params = []; // 存储参数的数组
    // 检查是否有传入的参数
    if (Object.keys(req.query).length > 2) {
      // 根据传入的参数动态生成SQL语句和参数数组
      const whereClause = Object.keys(req.query)
        ?.filter((key) => key !== "current" && key !== "pageSize")
        .map((key) => {
          let s = `${key} = ?`;

          if (key === "joinStartTime") {
            s = `joinTime >= ?`;
            params.push(new Date(req.query[key]));
          } else if (key === "joinEndTime") {
            s = `joinTime <= ?`;
            params.push(new Date(req.query[key]));
          } else if (key === "outStartTime") {
            params.push(new Date(req.query[key]));
            s = `outTime >= ?`;
          } else if (key === "outEndTime") {
            s = `outTime <= ?`;
            params.push(new Date(req.query[key]));
          } else {
            params.push(req.query[key]);
          }
          return s;
        })
        .join(" and ");
      sql = `select * from store where ${whereClause} limit ?,?;`;
      sqlAll = `select count(*) as total from store where ${whereClause};`
      arr = [...params, ...arr];
      arrAll = [...params, ...arr]
    }
    
    dbpool.connect(sqlAll,arr, (err, d) => {
      console.log(d[0]?.total);
      dbpool.connect(sql, arr, (err, data) => {
        if (!err) {
          res.send({
            success: true,
            data,
            total: d?.[0]?.total,
          });
        } else {
          res.send({
            success: false,
            message: err,
          });
        }
      });
    });
  },
  addStore(req, res) {
    const { token } = req.headers;
    if (!checkIsLogin(token)) {
      res.status(403).send({
        success: false,
        message: "登录过期，请重新登录！",
      });
    }
    const { joinNum, products } = req.body;
    const values = products
      ?.map((item) => {
        let s = `(${
          item?.productId
        }, 1,"${new Date().toLocaleString()}",1, "${joinNum}")`;

        return item?.num > 1
          ? `${s}-*-`
              .repeat(item?.num)
              ?.split("-*-")
              ?.filter((item) => !!item)
              ?.join(",")
          : s;
      })
      ?.join(",");
    const sql = `insert into store (productId, productNum, joinTime, isIn, joinNum) values ${values};`;

    dbpool.connect(sql, [], (err, data) => {
      if (!err) {
        res.send({
          success: true,
          message: "新增成功",
        });
      } else {
        res.send({
          success: false,
          message: err,
        });
      }
    });
  },
  updateStore(req, res) {
    const { token } = req.headers;
    if (!checkIsLogin(token)) {
      res.status(403).send({
        success: false,
        message: "登录过期，请重新登录！",
      });
    }
    const { id } = req.body;
    dbpool.connect("select * from store where id=?", [id], (err, data) => {
      if (!err) {
        dbpool.connect(
          "update store set isIn=? where id=?",
          [0, id],
          (e, d) => {
            if (!e) {
              res?.send({
                success: true,
                message: "出库成功",
              });
            } else {
              res.send({
                message: false,
                message: "出库失败",
              });
            }
          }
        );
      } else {
        res.send({
          message: false,
          message: "出库失败",
        });
      }
    });
  },
  deleteStore(req, res){
    const { id } = req.params;
    const { token } = req.headers;
    if (!checkIsLogin(token)) {
      res.status(403).send({
        success: false,
        message: "登录过期，请重新登录！",
      });
    }
    dbpool.connect("select * from store where id = ?", [id], (e) => {
      if (!e) {
        dbpool.connect("delete from store where id=?", [id], (err, data) => {
          if (!err) {
            res.send({
              success: true,
              message: "删除成功!",
            });
          } else {
            res.send({
              success: false,
              message: err,
            });
          }
        });
      } else {
        res.send({
          success: false,
          message: "库存不存在",
        });
      }
    });
  }
  // getList(req, res) {
  //   dbpool.connect("select * from product", [], (err, data) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       // console.log(data);
  //       // const newData = treeData(data);
  //       res.send(data);
  //     }
  //   });
  // },
  // add(req, res) {
  //   const id = getUUID();
  //   const data = req.body.data;
  //   const arr = [id, data.title, data.desc, data.date, data.parentId];
  //   dbpool.connect(
  //     "insert into list (id,title,`desc`,`date`,parentId,finish,children) values (?,?,?,?,?,'0','[]')",
  //     arr,
  //     (err, data) => {
  //       if (!err) {
  //         res.send(data);
  //       } else {
  //         console.log(err);
  //       }
  //     }
  //   );
  // },
  // edit(req, res) {
  //   const data = req.body.data;
  //   const arr = [data.title, data.desc, data.date, data.id];
  //   dbpool.connect(
  //     "update list set title=?,`desc`=?,`date`=? where id=?",
  //     arr,
  //     (err, data) => {
  //       if (!err) {
  //         res.send(data);
  //       } else {
  //         console.log(err);
  //       }
  //     }
  //   );
  // },
  // checked(req, res) {
  //   console.log(req.body.ids);
  //   const ids = req.body.ids;
  //   let sql = "update list set finish=? where";
  //   ids.forEach((id, index) => {
  //     if (index === ids.length - 1) {
  //       sql += ` id=${id}`;
  //     } else {
  //       sql += ` id=${id}  or`;
  //     }
  //   });
  //   dbpool.connect("update list set finish=?", [0], (err, data) => {
  //     if (!err) {
  //       dbpool.connect(sql, [1], (err, data) => {
  //         if (!err) {
  //           res.send(data);
  //         } else {
  //           res.send(err);
  //         }
  //       });
  //     } else {
  //       res.send(err);
  //     }
  //   });
  // },
};
module.exports = fileController;
