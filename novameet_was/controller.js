import connectionPool from "./db.js";
import bcrypt from "bcrypt";
import nodemailer from 'nodemailer'

const pool = connectionPool;

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

        // 입력된 id 와 동일한 id 가 mysql 에 있는 지 확인
        const idExistCheckQuery = `
        SELECT *
        FROM user 
        WHERE user_id = ?
        `
        
        connection.query(idExistCheckQuery, user_id, function (err, row) {
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
                    res.send({ user_id: row[0].user_id, user_displayname: row[0].user_displayname, msg: result });
                } else {
                    console.log(`로그인 실패, error message : ${error}`);
                    res.send({ user_id: null, user_displayname: null, msg: error });
                }
            });
        });
    });
};

export const postRegister = async (req, res) => {
    // console.log(`Received Request register, req : ${util.inspect(req)}`);
    console.log(`Received Request register`);

    const user_id = req.query.user_id;
    const user_pw = req.query.user_pw;
    const user_displayname = req.query.user_displayname;

    pool.getConnection((err, connection) => {
        if (!err) {

            // 아이디 이미 있는지 체크
            const idExistCheckQuery = `
            SELECT *
            FROM user 
            WHERE user_id = ?
            `
            const insertUserQuery = `
            INSERT INTO user(user_id, user_pw, user_displayname)
            VALUES (?,?,?)
            `;

            connection.query(idExistCheckQuery, user_id, (err, row) => {
                if (!err) {
                    if (row.length > 0) {
                        console.log("already ID Exist");
                        res.send({ responseCode: 0 });
                    } else {
                        /*
                        Todo 닉네임 검사 추가
                        (현재 콜백 뎁스가 높아서 코드가 더러우니, 추후 MariaDB 동기 처리 검토 후 기능 추가)
                        */
                        const params = [user_id, user_pw, user_displayname];

                        const saltRount = 10;
                        bcrypt.hash(params[1], saltRount, (error,hash) => {
                            params[1] = hash;
            
                            connection.query(insertUserQuery, params, (err, row) => {
                                if (!err) {
                                    console.log("registrationSuccess");
                                    res.send({responseCode: 1});
                                } else {
                                    console.log("registrationFailed");
                                    res.send({responseCode: -1});
                                }
                            });
                        });
                    }
                } 
            });
        } else {
            console.log(`Connection Error : ${err}`);
        }
    })
};

export const postEmailAuth = async (req, res) => {
    
    const user_email = req.query.user_email;
    const auth_number = req.query.auth_number;
    
    console.log(`received postEmailAuth, 
    user_email:${user_email}, auth_number:${auth_number}`);

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: "pompitzgeneral@gmail.com",
        pass: "dksk15315311!!"
      },
    });
    
    let mailOptions = {
      from: `pompitzgeneral.gmail.com`,
      to: user_email,
      subject: `Nova Meet 인증번호입니다.`,
      text: `인증번호 : ${auth_number}`
    }
    
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(`send mail Failed ${error}`);
        res.send({ responseCode: -1, msg: error });
      } else {
        console.log('Email sent: ' + info.response);
        res.send({ responseCode: 1, msg: null });
      }
    });
}

