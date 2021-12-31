import connectionPool from "../db.js";

const pool = connectionPool;

//room_owner_image_url
const selectRoomInfosQuery = `
SELECT 
room_id, 
room_password, 
room_owner, (
    SELECT user_image_url
    FROM user
    WHERE user.user_id = rooms.room_owner
) as room_owner_image_url, 
room_member_current_count,
room_member_max_count, 
room_thumbnail_url,
room_thumbnail_key
FROM rooms
ORDER BY room_idx DESC
`;

const roomExistCheckQuery = `
SELECT *
FROM rooms 
WHERE room_id = ?
`;

const insertRoomQuery = `
INSERT INTO rooms(room_id, room_owner, room_thumbnail_url, room_thumbnail_key, room_password, room_member_max_count)
VALUES (?,?,?,?,?,?)
`;

const deleteRoomQuery = `
DELETE FROM rooms
WHERE room_id = ?;
`;

export const postRequestRoomInfos = async (req, res) => {
    console.log(`Received postRequestRoomInfos`);

    // 1. 쿼리로 방 정보 가져오고
    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            res.send(err);
            return;
        }
        connection.query(selectRoomInfosQuery, null, (err, row) => {
            connection.release();
            if (err) {
                console.log(err);
                res.send(err);
                return;
            }
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
                    roomOwnerImageUrl: data.room_owner_image_url,
                    roomMemberCurrentCount: data.room_member_current_count,
                    roomMemberMaxCount: data.room_member_max_count,
                    roomThumbnailUrl: data.room_thumbnail_url,
                });
            }

            console.log(`roomInfos:`);
            console.log(roomInfos);

            res.send({ roomInfos: roomInfos });
        });
    });
}

export const postCreateRoom = async (req, res) => {

    console.log(`Received postCreateRoom`);
    console.log(`req.file:`, req.file);
    console.log(`req.body:`, req.body);
    console.log(`-----------------------`);

    const roomID = req.body.roomID;
    const roomOwner = req.body.roomOwner;
    const roomThumbnailUrl = req.file ? req.file.location : null;
    const roomThumbnailKey = req.file ? req.file.key : null;
    const roomPassword = req.body.roomPassword;
    const roomMemberMaxCount = req.body.roomMemberMaxCount;

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            res.send(err);
            return;
        }

        connection.query(roomExistCheckQuery, roomID, (err, row) => {
            if (err) {
                console.log(err);
                res.send(err);
                connection.release();
                return;
            }

            if (row.length > 0) {
                console.log("already roomID Exist");
                res.send({ responseCode: 0 });
            } else {
                const params = [roomID, roomOwner, roomThumbnailUrl, roomThumbnailKey, roomPassword, roomMemberMaxCount];

                connection.query(insertRoomQuery, params, (err, row) => {
                    if (!err) {
                        console.log("room Create Success");
                        res.send({ responseCode: 1 });
                    } else {
                        console.log("room Create Failed");
                        console.log(err);
                        res.send({ responseCode: -1 });
                    }
                });
            }
            connection.release();
        });
    })
}

export const postJoinRoom = async (req, res) => {
    const userID = req.body.userID;
    const roomID = req.body.roomID;
    const inputPassword = req.body.inputPassword;

    console.log(`received postJoinRoom, 
    userID:${userID}, 
    roomID:${roomID}, 
    inputPassword:${inputPassword}`);

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            res.send(err);
            return;
        }
        // 1. 전달받은 RoomID값을 갖는 Room을 찾는다
        connection.query(roomExistCheckQuery, roomID, (err, row) => {
            connection.release();
            if (err) {
                console.log(err);
                res.send(err);
                return;
            }
            if (row.length > 0) {
                const roomPassword = row[0].room_password;
                const roomOwner = row[0].room_owner;
                const roomMemberCurrentCount = row[0].room_member_current_count;
                const roomMemberMaxCount = row[0].room_member_max_count;

                // 2. 방 인원수 체크
                if (roomMemberCurrentCount >= roomMemberMaxCount) {
                  console.log("roomMemberCurrentCount:",roomMemberCurrentCount);
                  console.log("roomMemberMaxCount:",roomMemberMaxCount);
                    // 참여 가능한 인원수 다 찬 경우
                    res.send({ responseCode: 0 });
                    return;
                }
                // 3. 패스워드 체크
                if (roomPassword) {
                    if (inputPassword === roomPassword) {
                        // 방 입장 성공
                        (userID === roomOwner) ? 
                        res.send({ responseCode: 2 }) :
                        res.send({ responseCode: 1 });
                        
                    } else {
                        // 패스워드 인증 실패
                        res.send({ responseCode: -1 });
                    }
                } else {
                    // 방 입장 성공
                    (userID === roomOwner) ? 
                    res.send({ responseCode: 2 }) :
                    res.send({ responseCode: 1 });
                }
            } else {
                // 해당하는 방이 없음
                res.send({ responseCode: -2 });
            }
        });
    })
}

export const postDeleteRoom = async (req, res) => {
    const roomID = req.body.roomID;

    console.log(`received postDeleteRoom, 
    roomID:${roomID}`);

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
            res.send(err);
            return;
        }
        connection.query(roomExistCheckQuery, roomID, (err, row) => {
            if (err) {
                console.log(err);
                res.send(err);
                connection.release();
                return;
            }
            if (row.length > 0) {
                connection.query(deleteRoomQuery, roomID, (err, row) => {
                    if (!err) {
                        console.log("room Delete Success");
                        res.send({ responseCode: 1 });
                    } else {
                        console.log("room Delete Failed");
                        console.log(err);
                        res.send({ responseCode: -1 });
                    }
                });
            } else {
                // 방이 존재하지 않음
                res.send({ responseCode: 0 });
            }
            connection.release();
        });
    })
}