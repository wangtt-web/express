const userDao=require("../dao/userDao");
const userController= {
    login(req, resp) {
        let username = req.body.username;
        let pwd = req.body.pwd;
        console.log(username, pwd);
        userDao.checkUser([username, pwd])
            .then((data)=>{
                console.log(data);
                req.session.username=data[0].username;
                resp.render("index",{username:data[0].username})
            })


    },
    deleteUserMsg(req,resp){
       // req.session.username=null;

        req.session.destroy();
        resp.redirect("login.html");

    }
};
module.exports=userController;