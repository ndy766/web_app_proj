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

//mail service
var nodemailer = require('nodemailer');
var inlineCss = require('nodemailer-juice');//for nodemailer css

var transporter = nodemailer.createTransport('smtps://webappproj0623:my45951!@smtp.gmail.com');
transporter.use('compile', inlineCss());

var mailOptions = {
  from: 'webappproj0623@gmail.com',
  to: 'ndy766@daum.net',
  subject: 'hello',
  html: 'hihi'
};


//공휴일 지정
var holiday = require('../util/holiday');

/* GET home page. */
router.get('/', function(req, res) {

  res.render('calendar',{id:req.session.user.id});
});

router.get("/getAllEvent", function(req, res){
  //var start_range = new Date(parseInt(req.query.start)).getTime();
  //var end_range = new Date(parseInt(req.query.end)).getTime();

  //var sql = "SELECT * FROM event WHERE start <='" +end_range+"' AND end >= '"+start_range+"'";
  var sql = "SELECT * FROM event";

  conn.query(sql, function(err, result){
    var event_arr = result;
    var arr = [];

    for(var i=0;i<event_arr.length;i++){
      var start = new Date(parseInt(event_arr[i].start)).toISOString().split('T')[0];
      var end = new Date(parseInt(event_arr[i].end)).toISOString().split('T')[0];

      var color = "";

      if(event_arr[i].type=='default'){
        color="#5CD1E5";
      }else if(event_arr[i].type=='trip'){
        color="#F29661";
      }else if(event_arr[i].type=='vacation'){
        color="#86E57F";
      }else if(event_arr[i].type=='important'){
        color="#F15F5F";
      }

      var borderColor =  'white';
      var textColor = '#FFFFFF'; //default 흰색

      arr.push({
        title:event_arr[i].title+"("+ event_arr[i].writer+ ") / "+event_arr[i].place,
        color:color,
        textColor : textColor,
        start : start,
        end : end,
        no:event_arr[i].no,
        borderColor:borderColor
      });

    };

    //공휴일 정보 입력
    var holiday_arr = [];
    holiday_arr = holiday.getHolidayArrays();
    for(var i=0;i<holiday_arr.length;i++){
      arr.push(holiday_arr[i]);
    }
    res.send(arr);

  });

});

router.get('/registerForm', function(req,res){

  var msg = req.query.msg;
  (msg!='' && msg!=undefined && msg!=null)?msg=msg:msg='';

  var start = req.query.start;
  var end = req.query.end;

  var sql = "SELECT * FROM member ORDER BY name";
  conn.query(sql, function(err,result){
    var data = result;
    res.render('calendarRegisterForm',{start:start, end:end, memberList:data, msg:msg});
  });
});

router.post('/register', function(req,res){
  var start = req.body.start;
  var end = req.body.end;
  var title = req.body.title;
  var description = req.body.description;
  var place = req.body.place;
  var type = req.body.type;
  var participant = req.body.participant;
  var writer = req.session.user.name;
  var date = new Date();

  if(typeof(participant) == 'object'){
      var tmp ="";
      for(var i=0;i<participant.length;i++){
         tmp+=participant[i];
         if(i<participant.length-1){
           tmp+=",";
         }
      }
      participant = tmp;
  }


  var event = {
    start:start,
    end:end,
    title:title,
    description:description,
    place:place,
    type:type,
    participant:participant,
    writer:writer
  };
  var sql = "INSERT INTO event SET ?";
  conn.query(sql, event, function(err, result){
    var recent = {
      writer:req.session.user.name,
      type:"registerCalendar",
      date:date.getTime()
    }
    var sql2 = "INSERT INTO recent SET ?";
    conn.query(sql2, recent, function(err, result){
      msg ='등록 성공';
      res.redirect('/calendar/registerForm?msg='+msg+"&start="+start+"&end="+end);
    });

  });

});


//dropEvent - ajax
router.get('/dropEvent', function(req, res){
  var no = req.query.no;
  var start = req.query.start;
  var end = req.query.end;
  var date = new Date();

  var sql = "UPDATE event SET start='"+start+"', end='"+end+"' WHERE no="+no;
  conn.query(sql, function(err, result){
    var recent = {
      writer:req.session.user.name,
      type:"modifyCalendar",
      date:date.getTime()
    };
    var sql2 = "INSERT INTO recent SET ?";
    conn.query(sql2, recent, function(err, result){
      res.send();
    });

  });

});

//getEventByNo - ajax
router.get('/getEventByNo', function(req, res){
  var no = req.query.no;
  var start = req.query.start;
  var end = req.query.end;

  var msg = req.query.msg;
  (msg!='' && msg!=undefined && msg!=null)?msg=msg:msg='';

  var sql = "SELECT * FROM member ORDER BY name";
  conn.query(sql, function(err,result){
    var data = result;
    var sql2 = "SELECT * FROM event WHERE no="+no;
    conn.query(sql2, function(err, result){
      var event = result[0];
      res.render('calendarModifyForm',{start:start, end:end, memberList:data, msg:msg, event:event});
    });

  });

});

//modify
router.post('/modify', function(req, res){
  var no = req.body.no;
  var start = req.body.start;
  var end = req.body.end;
  var title = req.body.title;
  var description = req.body.description;
  var place = req.body.place;
  var type = req.body.type;
  var participant = req.body.participant;
  var writer = req.session.user.name;
  var date = new Date();

  if(typeof(participant) == 'object'){
    var tmp ="";
    for(var i=0;i<participant.length;i++){
      tmp+=participant[i];
      if(i<participant.length-1){
        tmp+=",";
      }
    }
    participant = tmp;
  }

  var event = {
    start:start,
    end:end,
    title:title,
    description:description,
    place:place,
    type:type,
    participant:participant,
    writer:writer
  };

  var sql = "UPDATE event SET ? WHERE no="+no;
  conn.query(sql, event, function(err, result){
    var recent = {
      writer:req.session.user.name,
      type:"modifyCalendar",
      date:date.getTime()
    };
    var sql2 = "INSERT INTO recent SET ?";
    conn.query(sql2, recent, function(err, result){
      msg ='수정 성공';
      res.redirect('/calendar/getEventByNo?no='+no+'&msg='+msg+"&start="+start+"&end="+end);
    });

  });



});




//delete
router.get('/delete', function(req, res){
  var no = req.query.no;
  var date = new Date();
  var sql = "DELETE FROM event WHERE no="+no;
  conn.query(sql, function(err, result){
    var recent = {
      writer:req.session.user.name,
      type:"deleteCalendar",
      date:date.getTime()
    };
    var sql2 = "INSERT INTO recent SET ?";
    conn.query(sql2, recent, function(err, result){
      res.send();
    });
  });

});


//mail전송
router.get('/sendMail', function(req, res){
  var no = req.query.no;
  var sql = "SELECT * FROM event WHERE no="+no;
  var writer = req.session.user.name;
  var date = new Date();

  conn.query(sql, function(err, result){
    var event = result[0];
    var participant = event.participant;
    var find = "";
    var email = "";
    if(participant.indexOf(',')!=-1) {
      var participant_arr = participant.split(',')
      for (var i = 0; i < participant_arr.length; i++) {
        find+="'"+participant_arr[i]+"'";
        if(i<participant_arr.length-1){
          find+=",";
        }
      }
    }else{
      find = "'"+participant+"'";
    }

    var sql2 = "SELECT * FROM member WHERE name IN("+find+")";
    conn.query(sql2, function(err, result){
      var memberList = result;
      for(var i=0;i<memberList.length;i++){
        email += memberList[i].email;
        if(i<memberList.length-1){
          email+=",";
        }
      }

      mailOptions.to = email;
      mailOptions.subject = '[중요]일정 확인 부탁드립니다 - '+event.title;
      mailOptions.html = '<h2>일정 요약</h2>'+
                         '<b>기간</b> : '+new Date(parseInt(event.start)).toISOString().split('T')[0]+' ~ '+new Date(parseInt(event.end)).toISOString().split('T')[0]+'<br>'+
                         '<b>일정 내용</b> : '+event.title+'<br>'+
                         '<b>장소</b> : '+event.place+'<br>'+
                         '<b>세부사항</b> : '+event.description+'<br>'+
                         '<b>참석 인원 : </b>'+event.participant+'<br>'+
                         '<hr>'+
                         '<b><i>전화나 메일로 참석여부 통보 바랍니다</i></b><br>'+
                         req.session.user.name+'('+req.session.user.phone+') / '+req.session.user.email;


      transporter.sendMail(mailOptions, function (err, result) {
        if (err) {
          console.log(mailOptions);
          return console.log(err);
        }
        var recent = {
          writer:writer,
          type:"sendMail",
          date:date.getTime()
        };
        var sql3 = "INSERT INTO recent SET ?";
        conn.query(sql3, recent, function(err, result){
          res.send();
        });
      });



    });





  });


});


module.exports = router;
