const dbpool=require("../config/dbpoolconfig");
const userModel={
    checkUser(params){
        return new Promise((resolve,reject)=>{
            dbpool.connect("select * from t_user where username=? and pwd=?",
                params,
                (err,data)=>{
                    console.log(err);
                    console.log(data);
                    if(!err){
                        if(data.length>0){
                            console.log(data[0].username);
                            resolve(data);
                        }
                    }
                })
        })
    }
};
module.exports=userModel;