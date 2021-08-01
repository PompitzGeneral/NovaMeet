import React, { useState, useEffect } from "react";
import {Link} from 'react-router-dom';
import "routes/Home.css"
import RoomContainerElement from "components/RoomContainerElement"
import axios from 'axios';

const Home = ({isLogin}) => {

  const [loginID] = useState("");
  // room table 정보 : roomID, roomOwner, roomMemberCurrntCount, roomMemberMaxCount, roomImagePath
  const [roomInfos, setRoomInfos] = useState([]);

  useEffect(() => {
      // 1. room 정보 요청 콜백 등록
      
      // 2. roomInfo에 데이터 업데이트(화면 갱신)
      console.log(`home, isLogin:${isLogin}`);

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
  }, []);

// 1. 동기식으로 방 진입 요청 결과 받아와야 함
// 2. 방 진입 요청 결과를 통해 조건부 Link 활성화
const requestJoinRoom = (roomInfo) => {
  if (roomInfo.hasPassword) {
    // 1. 패스워드 입력
    const inputPassword = prompt('패스워드 입력');
    if (inputPassword !== null) {
      // 2. 방 입장 요청
      axios.post('/api/joinRoom', null, {
        params: {
          'roomID': roomInfo.roomID,
          'inputPassword': inputPassword
          }
      })
      .then(res => {
        console.log(`received joinRoom. responseCode:${res.data.responseCode}`);
        if (res.data.responseCode === 1) {
          document.location.href = `/#/Chatroom/${roomInfo.roomID}`;
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
  } else {
    // 패스워드가 없는 케이스
    document.location.href = `/#/Chatroom/${roomInfo.roomID}`;
  }
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
              //Todo. 조건식 링크로 처리하기
              // <Link  
              // key={roomInfo.roomID} 
              // to={`/ChatRoom/${roomInfo.roomID}`}
              // onClick={isLogin ? () => { if (roomInfo.hasPassword) checkRoomPassword(roomInfo) } : showPleaseLogin}>
              //     <RoomContainerElement roomInfo={roomInfo}/>
              // </Link>
              <RoomContainerElement 
              key={roomInfo.roomID} 
              roomInfo={roomInfo}
              onClickCallBack={isLogin ? () => { requestJoinRoom(roomInfo) } : showPleaseLogin}/>
          ))}
        </div>
      </div>
  );
};
export default Home;
