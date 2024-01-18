const express = require("express");
const path = require("path");

//引入自己的模块userController
const Controller = require("../controller/Controller");

//处理文件上传的模块
const upload = require("../config/uploadconfig");

const router = express.Router(); //调用express对象的路由方法来获取路由对象

//路由拦截
//===========================上传下载==========================

// router.get('/', function (req, res) {
   
// })
// 登录
router.post('/login', Controller.login)

// 用户管理
router.get('/user/list', Controller.getUserList)
router.delete('/user/del', Controller.delUser)
router.post('/user/add', Controller.addUser)
router.put('/user/update', Controller.updateUser)

// 产品管理
router.get('/product/list', Controller.getProductList)
router.post('/product/add', Controller.addProduct)
router.put('/product/update', Controller.updateProduct)
router.delete('/product/delete/:id', Controller.deleteProduct)

// 库存管理
router.get('/store/list', Controller.getStoreList)
router.post('/store/add', Controller.addStore)
router.put('/store/update', Controller.updateStore)
router.delete('/store/delete/:id', Controller.deleteStore)

module.exports = router;
