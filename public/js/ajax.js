/*method:get/post
* url:地址
* params:参数
* callback:回调函数
* async:同步异步   true-异步  false-同步  */
let xhr=new XMLHttpRequest();
if(async=undefined)async=true;

function myAjax(method,url,params,callback,async) {


    xhr.onreadystatechange=function () {
        if(xhr.readyState==4&&xhr.status==200){
            callback()
        }
    };

    if(method=="get"){
        xhr.open(method,url+"?"+params,async);
        xhr.send(null);
    }else if(method=="post"){
        xhr.open(method,url,async);
        xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xhr.send(params);
    }

}