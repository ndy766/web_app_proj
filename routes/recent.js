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


/* GET home page. */
router.get('/getAllRecentList', function(req, res) {
  var sql = "SELECT * FROM recent ORDER BY date desc LIMIT 15";
  conn.query(sql, function(err, result){
    res.send(result);
  });

});

module.exports = router;
