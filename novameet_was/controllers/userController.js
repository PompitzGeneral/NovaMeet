import connectionPool from "../db.js";
import bcrypt from "bcrypt";

import aws from "aws-sdk";
aws.config.loadFromPath("s3config.json");

let s3 = new aws.S3();

const pool = connectionPool;

// 내부에서 한번 UserID 돌리고 집중시간 가져옴
const selectUserInfoQuery = `
SELECT *
FROM user 
WHERE user_id = ?
`;

const updateUserInfoQuery = `
UPDATE user
SET user_displayname = ?, user_image_url = ?, user_image_key = ?
WHERE user_id = ?
`;

const updateUserPasswordQuery = `
UPDATE user
SET user_pw = ?
WHERE user_id = ?
`;

const selectDailyFocusTimeQuery = `
SELECT daily_focus_time
FROM focus_time_record
WHERE user_idx = ? AND record_date = ?
`;

const insertDailyFocusTimeQuery = `
    INSERT INTO focus_time_record (record_date, daily_focus_time, user_idx)
    VALUE (?, ?, ?)
`

const updateDailyFocusTimeQuery = `
    UPDATE focus_time_record
    SET daily_focus_time = ?
    WHERE user_idx = ? AND record_date = ?
`

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

export const postRequestUserInfo = async (req, res) => {
    console.log(`[userController] Received postRequestUserInfo`);
    if (req.session.logined) {
        pool.getConnection((err, connection) => {
            if (err) {
                console.log(err);
                res.send(err);
                return;
            }
            
            connection.query(selectUserInfoQuery, req.session.user_id, (err, row) => {
                if (err) {
                    connection.release();
                    console.log(err);
                    res.send(err);
                    return;
                }
                let userInfo = null;
                if (row.length > 0) {
                    userInfo = {
                        userIdx: row[0].user_idx,
                        userID: row[0].user_id,
                        userDisplayName: row[0].user_displayname,
                        userImageUrl: row[0].user_image_url,
                        dailyFocusTime: null
                    }
                    let date = toStringByFormatting(new Date())
                    console.log("[userController] date :", date)
                    const params = [row[0].user_idx, date];
                    connection.query(selectDailyFocusTimeQuery, params, (err, row) => {
                        connection.release();
                        if (row.length > 0) {
                            userInfo.dailyFocusTime = row[0].daily_focus_time
                        }
                        
                        console.log("[userController] selectUserInfoQuery result, userInfo:", userInfo);
                        res.send({userInfo: userInfo});
                    });
                }
            });
        })
    } else {
        res.send({userInfo: null});
    }
}

export const postUpdateUserInfo = async (req, res) => {
    // console.log(req);
    console.log("req.file : ", req.file);
    console.log("req.body : ", req.body);

    const userImage = req.file ? req.file.location : null;
    const userImageKey = req.file ? req.file.key : null;
    const userID = req.body.user_id;
    const userDisplayName = req.body.user_displayname

    console.log(`Received postUpdateUserInfo`);

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            res.send(err);
            return;
        }

        console.log("userID:", userID);
        console.log("userImage:", userImage);
        console.log("userImageKey:", userImageKey);
        console.log("userDisplayName:", userDisplayName);
         connection.query(selectUserInfoQuery, userID, (err, row) => {     
            if (err) {
                console.log(err);
                connection.release();
                res.send({
                    responseCode: 0,
                    user_id: null,
                    user_displayname: null,
                    user_image: null,
                });
                return;
            }
            
            if (row.length <= 0) {
                console.log("responseCode: 0");
                connection.release();
                res.send({
                    responseCode: 0,
                    user_id: null,
                    user_displayname: null,
                    user_image: null,
                });
                return;
            }

             let originalUserImageKey = row[0].user_image_key;
             console.log('originalUserImageKey:', originalUserImageKey);

             const params = [userDisplayName, userImage, userImageKey, userID];
             connection.query(updateUserInfoQuery, params, (err, result) => {
                 connection.release();
                 if (err) {
                     console.log(err);
                     res.send({ responseCode: 0 });
                 } else {

                     try {
                        if (originalUserImageKey) {
                            s3.deleteObject({
                                Bucket: 'novameet',
                                Key: originalUserImageKey
                            }, (err, data) => {
                                if (err) { throw err; }
                                console.log('s3 deleteObject key', originalUserImageKey);
                            });
                        }
                     } catch (err) {
                         console.log(err);
                     }

                     res.send({
                        responseCode: 1,
                        user_id: userID,
                        user_displayname: userDisplayName,
                        user_image: userImage,
                    });
                    //  res.send({ responseCode: 1 });
                 }
             });
        });
    })
}

export const postUpdateUserPassword = async (req, res) => {
    // const userID = req.query.user_id;
    // const userPassword = req.query.user_password;
    // const userNewPassword = req.query.user_new_password
    const userID = req.body.user_id;
    const userPassword = req.body.user_password;
    const userNewPassword = req.body.user_new_password
    console.log(`Received postUpdateUserPassword`);

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            res.send(err);
            return;
        }

        console.log("req.session.user_id:", userID);
        console.log("req.session.user_password:", userPassword);
        console.log("req.session.user_new_password:", userNewPassword);
         connection.query(selectUserInfoQuery, userID, (err, row) => {     
            if (err) {
                console.log(err);
                connection.release();
                res.send({responseCode: 0});
                return;
            }
            
            if (row.length <= 0) {
                console.log("responseCode: 0");
                connection.release();
                res.send({responseCode: 0});
                return;
            } 

            //패스워드 비교
            bcrypt.compare(userPassword, row[0].user_pw, (error, result) => {
                if (result) {
                    const params = [userNewPassword, userID];
                    const saltRount = 10;
                    bcrypt.hash(params[0], saltRount, (error, hash) => {
                        params[0] = hash;
                        connection.query(updateUserPasswordQuery, params, (err, result) => {
                            connection.release();
                            if (err) {
                                console.log("패스워드 변경 실패");
                                console.log(err);
                                res.send({ responseCode: -1 });
                            } else {
                                console.log("패스워드 변경 성공");
                                res.send({ responseCode: 1 });
                            }
                        });
                    });
                } else {
                    console.log(`패스워드가 틀렸습니다., error message : ${error}`);
                    connection.release();
                    res.send({ responseCode: 0 });
                }
            });    
        });
    })
}



export const postActiveUserInfo = async (req, res) => {
    const userID = req.query.user_id;
    console.log(`Received postActiveUserInfo, user_id:${user_id}`);
    

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            res.send(err);
            return;
        }

         connection.query(selectUserInfoQuery, userID, (err, row) => {
            connection.release();
            if (err) {
                console.log(err);
                res.send(err);
                return;
            }
            
            // 로직 구현
        });
    })
}

export const postInactiveUserInfo = async (req, res) => {
    const userID = req.query.user_id;
    console.log(`Received postInactiveUserInfo, user_id:${user_id}`);

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            res.send(err);
            return;
        }

         connection.query(selectUserInfoQuery, userID, (err, row) => {
            connection.release();
            if (err) {
                console.log(err);
                res.send(err);
                return;
            }
            
            // 로직 구현
        });
    })
}

export const postUpdateDailyFocusTime = async (req, res) => {
    console.log("[userController] received postUpdateDailyFocusTime")
    console.log("[userController] req.body :", req.body)
    const userIdx = req.body.userIdx;
    const dailyFocusTime = req.body.dailyFocusTime;
    const recordDate = toStringByFormatting(new Date())

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            res.send(err);
            return;
        }
        let params = [userIdx, recordDate];
        connection.query(selectDailyFocusTimeQuery, params, (err, row) => {
            if (err) {
                console.log(err);
                res.send(err);
                connection.release();
                return;
            }
            // 당일 집중시간 데이터 기록 존재함
            if (row.length > 0) {
                // update
                console.log("[userController] Do updateDailyFocusTimeQuery");
                params = [dailyFocusTime, userIdx, recordDate]
                connection.query(updateDailyFocusTimeQuery , params, (err, row) => {
                    if (!err) {
                        console.log("updateDailyFocusTimeQuery Success");
                        res.send({ responseCode: 1 });
                    } else {
                        console.log("updateDailyFocusTimeQuery Failed");
                        console.log(err);
                        res.send({ responseCode: -1 });
                    }
                });
            } else {
                // 당일 집중시간 데이터 기록 존재하지 않음
                console.log("[userController] Do insertDailyFocusTimeQuery");
                params = [recordDate, dailyFocusTime, userIdx]
                connection.query(insertDailyFocusTimeQuery , params, (err, row) => {
                    if (!err) {
                        console.log("insertDailyFocusTimeQuery Success");
                        res.send({ responseCode: 1 });
                    } else {
                        console.log("insertDailyFocusTimeQuery Failed");
                        console.log(err);
                        res.send({ responseCode: -1 });
                    }
                });
            }
            connection.release();
        });
    })
}