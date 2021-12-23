import connectionPool from "../db.js";
import bcrypt from "bcrypt";
import nodemailer from 'nodemailer'

const TAG = "authController"
const pool = connectionPool;

// 입력된 id 와 동일한 id 가 mysql 에 있는 지 확인
const emailExistCheckQuery = `
SELECT *
FROM user 
WHERE user_id = ?
`;

const insertUserQuery = `
INSERT INTO user(user_id, user_pw, user_displayname)
VALUES (?,?,?)
`;

const selectDailyFocusTimeQuery = `
SELECT daily_focus_time
FROM focus_time_record
WHERE user_idx = ? AND record_date = ?
`;


function leftPad(value) {
  if (value >= 10) {
    return value;
  }
  return `0${value}`;
}

function toStringByFormatting(source, delimiter = '-') {
  const year = source.getFullYear();
  const month = leftPad(source.getMonth() + 1);
  const day = leftPad(source.getDate());
  return [year, month, day].join(delimiter);
}

export const postLogin = async (req, res) => {
  // console.log(`Received Request Login, req : ${util.inspect(req)}`);
  console.log(`Received Request Login`);
  console.log(`req.body : `, req.body);
  const user_id = req.body.user_id;
  const user_pw = req.body.user_pw;
  pool.getConnection((err, connection) => {
    console.log(`getConnection`);
    if (err) {
      console.log(`Connection Error : ${err}`);
      return;
    }

    connection.query(emailExistCheckQuery, user_id, function (err, row) {
      if (err) {
        connection.release();
        console.log(err);
        res.send(err);
        return;
      }

      if (row.length <= 0) {
        connection.release();
        console.log('ID가 존재하지 않습니다.');
        res.send({ responseCode: 0, user_id: null, user_displayname: null, user_image_url: null, msg: 'ID가 존재하지 않습니다.' });
        return;
      }

      // 동일한 id 가 있으면 비밀번호 일치 확인
      console.log('ID 확인 성공. 확인된 계정 정보');
      console.log('----------------------------');
      console.log(`user_idx:${row[0].user_idx}`);
      console.log(`user_id:${row[0].user_id}`);
      console.log(`user_pw:${row[0].user_pw}`);
      console.log(`user_displayname:${row[0].user_displayname}`);
      console.log('----------------------------');
      bcrypt.compare(user_pw, row[0].user_pw, (error, result) => {
        if (result) {
          console.log(`${row[0].user_id}:패스워드 일치 로그인 성공`);
          console.log(req.session);
          req.session.logined = true;
          req.session.user_id = row[0].user_id;

          let dailyfocusTime = null;

          let date = toStringByFormatting(new Date());
          console.log("[authController] date :", date);

          let userInfo = {
            userIdx: row[0].user_idx,
            userID: row[0].user_id,
            userDisplayName: row[0].user_displayname,
            userImageUrl: row[0].user_image_url,
            dailyFocusTime: null
          }

          const params = [row[0].user_idx, date];
          connection.query(selectDailyFocusTimeQuery, params, (err, row) => {
            if (row.length > 0) {
              userInfo.dailyfocusTime = row[0].daily_focus_time
            }

            console.log("[authController] selectUserInfoQuery result, userInfo:", userInfo);
            res.send({
              responseCode: 1,
              user_idx: userInfo.userIdx,
              user_id: userInfo.userID,
              user_displayname: userInfo.userDisplayName,
              user_image_url: userInfo.userImageUrl,
              dailyFocusTime: userInfo.dailyfocusTime
            });
          });
        } else {
          console.log(`로그인 실패, error message : ${error}`);
          res.send({ responseCode: -1, user_id: null, user_displayname: null, user_image_url: null, msg: error });
        }
      });
      connection.release();
    });
  });

  console.log(`${TAG} getConnection failed`);
};

export const postLogout = async (req, res) => {
  console.log("postLogout");
  console.log(req.session);
  // req.session.destroy();
  await req.session.destroy((err) => {
    console.log(`session Destroyed`);
  });
  res.send({ responseCode: 1 });
}

export const postRegister = async (req, res) => {
  // console.log(`Received Request register, req : ${util.inspect(req)}`);
  console.log(`Received Request register`);
  console.log(`req.body : `, req.body);


  const user_id = req.body.user_id;
  const user_pw = req.body.user_pw;
  const user_displayname = req.body.user_displayname;

  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.send(err);
      return;
    }

    connection.query(emailExistCheckQuery, user_id, (err, row) => {
      if (err) {
        console.log(err);
        res.send(err);
        return;
      }

      if (row.length > 0) {
        console.log("already ID Exist");
        res.send({ responseCode: 0 });
        connection.release();
        return;
      }

      /*
         Todo 닉네임 검사 추가
         (현재 콜백 뎁스가 높아서 코드가 더러우니, 추후 MariaDB 동기 처리 검토 후 기능 추가)
         */
      const params = [user_id, user_pw, user_displayname];

      const saltRount = 10;
      bcrypt.hash(params[1], saltRount, (error, hash) => {
        params[1] = hash;

        connection.query(insertUserQuery, params, (err, row) => {
          connection.release();
          if (!err) {
            console.log("registrationSuccess");
            res.send({ responseCode: 1 });
          } else {
            console.log("registrationFailed");
            res.send({ responseCode: -1 });
          }
        });
      });
    });
  })
};

export const postEmailAuth = async (req, res) => {

  // const user_email = req.query.user_email;
  // const auth_number = req.query.auth_number;

  const user_email = req.body.user_email;
  const auth_number = req.body.auth_number;


  console.log(`received postEmailAuth, user_email:${user_email}, auth_number:${auth_number}`);
  console.log(`req.body:`, req.body)
  let start = new Date().getTime();
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.send(err);
      return;
    }
    connection.query(emailExistCheckQuery, user_email, (err, row) => {
      connection.release();
      let end = new Date().getTime();
      console.log(`이메일 체크 쿼리 소요시간  : ${(end - start)}ms`);

      if (err) {
        console.log(err);
        res.send(err);
        return;
      }

      if (row.length > 0) {
        console.log("already ID Exist");
        res.send({ responseCode: 0 });
      } else {
        sendEmail(res, user_email, auth_number);
      }
    });
  })
}

function sendEmail(res, emailAddress, authNumber) {

  const mailConfig = {
    service: process.env.MAIL_SERVICE,
    host: process.env.MAIL_HOST,
    port: 587,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  }

  let mailOptions = {
    from: process.env.MAIL_USER,
    to: emailAddress,
    subject: `Nova Meet 인증번호입니다.`,
    text: `인증번호 : ${authNumber}`
  }


  let transporter = nodemailer.createTransport(mailConfig);
  const start = new Date().getTime();
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(`send mail Failed ${error}`);
      res.send({ responseCode: -1, msg: error });
    } else {
      console.log('Email sent: ' + info.response);
      res.send({ responseCode: 1, msg: null });
    }
    const end = new Date().getTime();
    console.log(`메일 전송 메서드 실행시간  : ${(end - start)}ms`);
  });
}






