import connectionPool from "../db.js";
import bcrypt from "bcrypt";
import nodemailer from 'nodemailer'

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

export const postLogin = async (req, res) => {
    // console.log(`Received Request Login, req : ${util.inspect(req)}`);
    console.log(`Received Request Login`);
    const user_id = req.query.user_id;
    const user_pw = req.query.user_pw;
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(`Connection Error : ${err}`);
            return;
        } 

        connection.query(emailExistCheckQuery, user_id, function (err, row) {
            connection.release();
            if (err) {
                console.log(err);
                res.send(err);
                return;
            }

            if (row.length <= 0) {
                console.log('ID가 존재하지 않습니다.');
                res.send({ 'msg': 'ID가 존재하지 않습니다.' });
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
                    res.send({ user_id: row[0].user_id, user_displayname: row[0].user_displayname, user_image: null, msg: result });
                } else {
                    console.log(`로그인 실패, error message : ${error}`);
                    res.send({ user_id: null, user_displayname: null, user_image: null, msg: error });
                }
            });
        });
    });
};

export const postLogout = async (req, res) => { 
    console.log("postLogout");
    console.log(req.session);
    // req.session.destroy();
    await req.session.destroy((err) => {
        console.log(`session Destroyed`);
    });
    res.send({responseCode: 1});
}

export const postRegister = async (req, res) => {
    // console.log(`Received Request register, req : ${util.inspect(req)}`);
    console.log(`Received Request register`);

    const user_id = req.query.user_id;
    const user_pw = req.query.user_pw;
    const user_displayname = req.query.user_displayname;

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
    
    const user_email = req.query.user_email;
    const auth_number = req.query.auth_number;
    
    console.log(`received postEmailAuth, user_email:${user_email}, auth_number:${auth_number}`);


    

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
        console.log(`메일 전송 메서드 실행시간  : ${(end-start)}ms`);
      });
 }




