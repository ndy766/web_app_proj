/**
 * Created by daeyoung on 2016-12-27.
 */
var express = require('express');
var router = express.Router();

//db
var mysql = require('mysql');
var DBoption = {
    host:'ndy766.cpaacnjpvo5o.ap-northeast-2.rds.amazonaws.com',
    port:3306,
    user:'ndy766',
    password:'shel45951!',
    database:'webappproj'
};
var conn = mysql.createConnection(DBoption);
conn.connect();


router.get('/', function(req, res){
    if(req.session.user){
        res.render('main', {id:req.session.user.id});
    }else {
        res.redirect('/');
    }
});


router.post('/', function(req, res) {

    var id = req.body.id;
    var password = req.body.password;
    var user = {
        id: id,
        password: password
    };
    var sql = "SELECT * FROM member";

    conn.query(sql, function (err, result) {
        var data = result;
        var flag = 'id';
        
        //id, pwd 비교
        for(var i=0;i<data.length;i++){
            if (id == data[i].id) {
                if (password == data[i].password) {
                    user = data[i];
                    req.session.user = user;
                    flag= 'success';
                    break;
                } else {
                    flag='pwd'
                }
            }
        }


        if(flag=='success'){
            var date= new Date();
            var recent = {
                writer:req.session.user.name,
                type:"login",
                date:date.getTime()
            };
            var sql2 = "INSERT INTO recent SET ?";
            conn.query(sql2, recent, function(err, result){
                res.render('main', {id:user.id});
            });

        }else if (flag=='id'){
            res.redirect('/?errorMessage=id');
            return;
        }else {
            res.redirect('/?errorMessage=pwd');
            return;
        }


        
    });

});


router.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/');
});


router.post('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
