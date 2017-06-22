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


router.get('/registerForm', function(req, res){
  res.render('registerForm', {});
});

router.post('/register', function(req, res){
  var id = req.body.id;
  var password=  req.body.password;
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;
  var phone2 = req.body.phone2;
  var phone3 = req.body.phone3;
  phone = phone+'-'+phone2+"-"+phone3;

  var member = {
    id:id,
    password:password,
    name:name,
    email:email,
    phone:phone
  };

  var sql = "INSERT INTO member SET ?";
  conn.query(sql, member, function(err, result){
    res.redirect('/');
  });

});

//모든 memberList가져오기
router.get('/getAllMemberList', function(req, res){
  var sql = "SELECT * FROM member ORDER BY name";
  conn.query(sql, function(err, result){
    res.send(result);

  });


});

router.get('/getMemberById', function(req, res){
  var id = req.query.id;
  var sql = "SELECT * FROM member WHERE id='"+id+"'";
  conn.query(sql, function(err, result){
    var member = result[0];
    res.render('memberDetail', {member:member, id:req.session.user.id});
  });

});

router.post('/modify', function(req, res){
  var id = req.body.id;
  var password=  req.body.password;
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;
  var phone2 = req.body.phone2;
  var phone3 = req.body.phone3;
  phone = phone+'-'+phone2+"-"+phone3;

  var member = {
    password:password,
    name:name,
    email:email,
    phone:phone
  };
  var sql = "UPDATE member SET ? WHERE id='"+id+"'";
  conn.query(sql, member, function(err, result){
    res.redirect('/member/getMemberById?id='+id);
  });

});


//탈퇴
router.get('/deleteMember', function(req, res){
  var id = req.query.id;
  var sql = "DELETE FROM member WHERE id='"+id+"'";
  conn.query(sql, function(err, result){
    res.send();
  });
});


module.exports = router;
