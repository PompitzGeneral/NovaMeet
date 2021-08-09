
import React, { useState } from "react";
import "components/Header.css"
import RoomCreationDlg from "components/RoomCreationDlg"
import { Link } from 'react-router-dom';
import axios from 'axios';
import Avatar from '@material-ui/core/Avatar';

const Header = ({ isLoggedIn, userInfo }) => {

  const [dlgIsOpen, setDlgIsOpen] = useState(false);

  const onMenuButtonClicked = () => {
    console.log("Menu Button Clicked");
    //Todo. 메뉴 열기 닫기
  };

  const onCreateRoomButtonClicked = () => {
    console.log("onCreateRoomButtonClicked");

    openCreateRoomDlg();
  }

  const onLogoutButtonClicked = () => {
    console.log("onLogoutButtonClicked");

    axios.post('/api/logout', null, null)
      .then(res => {
        console.log(res);

        if (res.data.responseCode === 1) {
          //화면갱신하여 로그아웃상태의 헤더 전시
          //document.location.href = '/#/';
          document.location.href = '/';
        }
      })
      .catch();
  }

  const createRoom = (roomName, roomImage, roomPassword, roomMemberMaxCount) => {
    console.log("createRoom, userInfo : ");
    console.log(userInfo);

    // 1. DB에 방 정보 저장
    axios.post('/api/createRoom', null, {
      params: {
        'roomID': roomName,
        'roomOwner': userInfo.displayName,
        'roomImage': roomImage,
        'roomPassword': roomPassword,
        'roomMemberMaxCount': roomMemberMaxCount
      }
    })
      .then(res => {
        console.log(res);
        console.log(`res.data.responseCode : ${res.data.responseCode}`);
        if (res.data.responseCode === 1) {
          console.log("방 생성 완료");
          alert('방 생성 완료');
          closeCreateRoomDlg();
          //window.open("/#/ChatRoom");
          document.location.href = `/#/ChatRoom/${roomName}`;

        } else if (res.data.responseCode === 0) {
          alert('이미 같은 이름의 방이 존재합니다.');
        } else {
          alert('방 생성 예외 케이스. Server Log 확인 필요');
        }
      })
      .catch();
  };

  const openCreateRoomDlg = () => { setDlgIsOpen(true); }
  const closeCreateRoomDlg = () => {
    //Todo. dlg unmount 시 state 초기화
    setDlgIsOpen(false);
  }

  return (
    <div className="header">
      <div className="header__left">
        {/* 네비게이션 바 제어 기능 구차 */}
        <i id="menu" className="material-icons">menu</i>
        <Link to="/"><img src="teamnova_logo.png" /></Link>
      </div>

      <div className="header__search">
        <form action="">
          <input type="text" placeholder="Search" />
          <button><i className="material-icons">search</i></button>
        </form>
      </div>


      <div className="header__icons">

        {/* <i className="material-icons display-this">search</i>
          <i className="material-icons">videocam</i>
          <i className="material-icons">apps</i>
          <i className="material-icons">notifications</i> */}

      </div>
      <div className="header__right">
        {isLoggedIn ? (
          <>
            <div className="header__right__element" onClick={onCreateRoomButtonClicked}>
              <i className="material-icons">add_circle_outline</i>
              <span>방 만들기</span>
            </div>
            <RoomCreationDlg dlgIsOpen={dlgIsOpen} createRoomCallBack={createRoom} closeDlgCallBack={closeCreateRoomDlg} />

            <div className="header__right__element" onClick={onLogoutButtonClicked}>
              <i className="material-icons">logout</i>
              <span>로그아웃</span>
            </div>
            <Link to="/Profile">
              {/* <div className="header__right__element">
                <i className="material-icons">account_circle</i>
                <span>마이페이지</span>
              </div> */}
              <Avatar alt="Remy Sharp" src={userInfo.userImageUrl} />
            </Link>
          </>
        ) : (
          <>
            <Link to="/Login">
              {/* className="sidebar__category" */}
              <div>
                <i className="material-icons">login</i>
                <span>로그인</span>
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;