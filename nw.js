let Service = require('node-windows').Service;

let svc = new Service({
    name:'node_liveroom', // 服务名称
    description:'这是一个测试', //描述
    script:'./app.js', // nodejs项目要启动的文件路径
    wait:'1',// 程序崩溃后重启的时间间隔,
    grow:'0.25', // 重启等待时间成长值，比如第一次1s， 第二次1.25s
    maxRestarts:'40', // 60s内最大重启次数
})

// 监听安装事件
svc.on('install',()=>{
    svc.start();
    console.log('install complete.');
})

// 监听卸载事件
svc.on('uninstall',()=>{
    console.log('uninstall complete.');
    console.log('The service exists:', svc.exists);
})

// 防止程序运行2次
svc.on('alreadyinstalled',()=>{
    console.log('this services is already installed.');
})

//如果存在就卸载
if(svc.exists) return svc.uninstall();

// 不存在就安装
svc.install()