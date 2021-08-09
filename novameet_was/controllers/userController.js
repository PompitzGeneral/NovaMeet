import connectionPool from "../db.js";
import bcrypt from "bcrypt";

import aws from "aws-sdk";
aws.config.loadFromPath("s3config.json");

let s3 = new aws.S3();

const pool = connectionPool;

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

export const postRequestUserInfo = async (req, res) => {
    console.log(`Received postRequestUserInfo`);
    if (req.session.logined) {
        pool.getConnection((err, connection) => {
            if (err) {
                console.log(err);
                res.send(err);
                return;
            }
            console.log("req.session.user_id:", req.session.user_id);
            connection.query(selectUserInfoQuery, req.session.user_id, (err, row) => {
                connection.release();
                if (err) {
                    console.log(err);
                    res.send(err);
                    return;
                }

                let userInfo = null;
                if (row.length > 0) {
                    userInfo = {
                        userID: row[0].user_id,
                        userDisplayName: row[0].user_displayname,
                        userImageUrl: row[0].user_image_url
                    }
                }
                
                console.log("selectUserInfoQuery result, userInfo:", userInfo);
                res.send({userInfo: userInfo});
            });
        })
    } else {
        res.send({userInfo: null});
    }
}

export const postUpdateUserInfo = async (req, res) => {
    console.log(req);
    console.log(req.file);
    console.log(req.body);

    const userImage = req.file ? req.file.location : null;
    const userImageKey = req.file ? req.file.key : null;
    const userID = req.body.user_id;
    const userDisplayName = req.body.user_displayname

    console.log(`Received postRequestUserInfo`);

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
                res.send({responseCode: 0});
                return;
            }
            
            if (row.length <= 0) {
                console.log("responseCode: 0");
                connection.release();
                res.send({responseCode: 0});
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

                     res.send({ responseCode: 1 });
                 }
             });
        });
    })
}

export const postUpdateUserPassword = async (req, res) => {
    const userID = req.query.user_id;
    const userPassword = req.query.user_password;
    const userNewPassword = req.query.user_new_password
    console.log(`Received postRequestUserInfo`);

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