import React, { useState, useEffect } from "react";
import {useHistory, useLocation } from 'react-router-dom';
import "routes/Home.css"
import RoomContainerElement from "components/RoomContainerElement"
import axios from 'axios';

const Home = ({ isLoggedIn, userInfo }) => {

  const [roomInfos, setRoomInfos] = useState([]);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
      console.log(`Home, isLoggedIn : ${isLoggedIn}`);
      console.log(`Home, userInfo :`, userInfo);

      axios.post('/api/requestRoomInfos', null, null)
        .then(res => {
          console.log(res);
          console.log(`res.data.roomInfos : `);
          console.log(res.data.roomInfos);
          if("roomInfos" in res.data) {
            setRoomInfos(res.data.roomInfos);
          }
        })
      .catch();

      if (location.state) {
        console.log("Home, location.state : ", location.state)
        if (location.state.from === 'chatRoom') {
          if (location.state.isRoomOwner === true) {
            alert("성공적으로 화상 채팅방을 삭제했습니다.");
          } else {
            alert("방장이 화상 채팅방을 삭제했습니다.");
          }
        }
      }
  }, []);

const onRoomClicked = (roomInfo) => {
  const inputPassword = null;
  if (roomInfo.hasPassword) {
    // 1. 패스워드 입력
    const inputPassword = prompt('패스워드 입력');
    if (inputPassword !== null) {
      // 2. 방 입장 요청
      requestJoinRoom(roomInfo, inputPassword);
    }
  } else {
    requestJoinRoom(roomInfo, inputPassword);
  }
}

const requestJoinRoom = (roomInfo, inputPassword) => {
  axios.post('/api/joinRoom', null, {
    params: {
      'userID' : userInfo.userID,
      'roomID': roomInfo.roomID,
      'inputPassword': inputPassword
      }
  })
  .then(res => {
    console.log(`received joinRoom. responseCode:${res.data.responseCode}`);
    if (res.data.responseCode === 2) {
      history.push({
        pathname:`/Chatroom/${roomInfo.roomID}`, 
        state: {userInfo: userInfo, isRoomOwner: true}
      });
    } else if (res.data.responseCode === 1) {
      history.push({
        pathname:`/Chatroom/${roomInfo.roomID}`, 
        state: {userInfo: userInfo, isRoomOwner: false}
      });
    } else if (res.data.responseCode === 0) {
      alert("참여 가능한 인원수가 다 찼습니다.");
    } else if (res.data.responseCode === -1) {
      alert("패스워드가 틀렸습니다");
    } else if (res.data.responseCode === -2) {
      alert("패스워드가 틀렸습니다");
    } else if (res.data.responseCode === -3) {
      alert("방이 존재하지 않습니다");
    } else {
      console.log("/api/joinRoom, 예외 케이스. Server Log 확인 필요");
    }
  })
  .catch();
}

const showPleaseLogin = () => {
    alert("로그인이 필요합니다");
    document.location.href = `/#/Login`;
    return;
}

  return (
      <div className="rooms">
        <h1>방 목록</h1>
        <div className="rooms__container">
          {
          roomInfos.map((roomInfo) => (
              <RoomContainerElement 
              key={roomInfo.roomID} 
              roomInfo={roomInfo}
              onClickCallBack={isLoggedIn ? () => { onRoomClicked(roomInfo) } : showPleaseLogin}/>
          ))}
        </div>
      </div>
  );
};
export default Home;
