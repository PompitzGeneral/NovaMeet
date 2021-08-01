import connectionPool from "../db.js";

const pool = connectionPool;

const selectRoomInfosQuery = `
SELECT room_id, room_password, room_owner, room_member_current_count, room_member_max_count, room_image_path
FROM rooms
`;

const roomExistCheckQuery = `
SELECT *
FROM rooms 
WHERE room_id = ?
`;

const insertRoomQuery = `
INSERT INTO rooms(room_id, room_owner, room_image_path, room_password, room_member_max_count)
VALUES (?,?,?,?,?)
`;

export const postRequestRoomInfos = async (req, res) => {
    console.log(`received postRequestRoomInfos`);

    // 1. 쿼리로 방 정보 가져오고
    pool.getConnection((err, connection) => {
        if (!err) {
            connection.query(selectRoomInfosQuery, null, (err, row) => {
                if (!err) {
                    let roomInfos = [];
                    for (let data of row) {
                        console.log(`roomPasswd:${data.room_password}`);
                        let hasPassword = false;
                        if (data.room_password) {
                            hasPassword = true;
                        }
                        roomInfos.push({
                           roomID: data.room_id,
                           hasPassword: hasPassword,
                           roomOwner: data.room_owner,
                           roomMemberCurrentCount: data.room_member_current_count,
                           roomMemberMaxCount: data.room_member_max_count,
                           roomImagePath: data.room_image_path
                        });
                    }

                    console.log(`roomInfos:`);
                    console.log(roomInfos);

                    res.send({roomInfos: roomInfos});
                } else {
                    console.log(`query err:${err}`);
                }  
            });
        } else {
            console.log(`Connection Error : ${err}`);
        }

        if (connection) {
            console.log(`connection.release()`);
            connection.release();
        }
    });
}

export const postCreateRoom = async (req, res) => {
    
    const roomID = req.query.roomID;
    const roomOwner = req.query.roomOwner;
    const roomImage = req.query.roomImage;
    const roomPassword = req.query.roomPassword;
    const roomMemberMaxCount = req.query.roomMemberMaxCount;
    
    console.log(`received postCreateRoom, 
    roomID:${roomID}, 
    roomOwner:${roomOwner}, 
    roomImage:${roomImage}, 
    roomPassword:${roomPassword}, 
    roomMemberMaxCount:${roomMemberMaxCount}`);

    pool.getConnection((err, connection) => {
        if (!err) {
            connection.query(roomExistCheckQuery, roomID, (err, row) => {
                if (!err) {
                    if (row.length > 0) {
                        console.log("already roomID Exist");
                        res.send({ responseCode: 0 });
                    } else {
                        const params = [roomID, roomOwner, roomImage, roomPassword, roomMemberMaxCount];

                        connection.query(insertRoomQuery, params, (err, row) => {
                                if (!err) {
                                    console.log("room Create Success");
                                    res.send({responseCode: 1});
                                } else {
                                    console.log("room Create Failed");
                                    console.log(err);
                                    res.send({responseCode: -1});
                                }
                        });
                    }
                } else {
                    console.log(`query err:${err}`);
                }
            });
        } else {
            console.log(`Connection Error : ${err}`);
        }

        if (connection) {
            connection.release();
        }
    })
}

export const postJoinRoom = async (req, res) => {
    const roomID = req.query.roomID;
    const inputPassword = req.query.inputPassword;
    
    console.log(`received postJoinRoom, 
    roomID:${roomID}, 
    inputPassword:${inputPassword}`);

    pool.getConnection((err, connection) => {
        if (!err) {
            // 1. 전달받은 RoomID값을 갖는 Room을 찾는다
            connection.query(roomExistCheckQuery, roomID, (err, row) => {
                if (!err) {
                    if (row.length > 0) {
                        const roomPassword =  row[0].room_password;
                        const roomOwner = row[0].room_owner;
                        const roomMemberCurrentCount = row[0].room_member_current_count;
                        const roomMemberMaxCount = row[0].room_member_max_count;
                        const roomImagePath = row[0].room_image_path;

                        // 2. 방 인원수 체크
                        if (roomMemberCurrentCount >= roomMemberMaxCount) {
                            // 참여 가능한 인원수 다 찬 경우
                            res.send({responseCode: 0});
                            return;
                        } 
                        // 3. 패스워드 체크
                        if (inputPassword === roomPassword) {
                            // 방 입장 성공
                            res.send({responseCode: 1});
                        } else {
                            // 패스워드 인증 실패
                            res.send({responseCode: -1});
                        }
                    } else {
                         // 해당하는 방이 없음
                         res.send({responseCode: -2});
                    }
                } else {
                    console.log(`query err:${err}`);
                }
            });
        } else {
            console.log(`Connection Error : ${err}`);
        }

        if (connection) {
            connection.release();
        }
    })
}