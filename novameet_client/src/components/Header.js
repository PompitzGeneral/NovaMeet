
import React, { useState } from "react";
import "components/Header.css"
import RoomCreationDlg from "components/RoomCreationDlg"
import { Link, useLocation, useHistory } from 'react-router-dom';
import axios from 'axios';
import Avatar from '@material-ui/core/Avatar';

const Header = ({ isLoggedIn, userInfo }) => {

  const [dlgIsOpen, setDlgIsOpen] = useState(false);
  const {pathname, search} = useLocation();
  const history = useHistory();

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

  const openCreateRoomDlg = () => { setDlgIsOpen(true); }
  const closeCreateRoomDlg = () => {
    //Todo. dlg unmount 시 state 초기화
    setDlgIsOpen(false);
  }

  console.log("Header pathName:", pathname);
  console.log("Header search:", search);

  if (pathname.includes('/Chatroom')) { 
    return null; 
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

       </div>
       <div className="header__right">
         {isLoggedIn ? (
           <>
             <div className="header__right__element" onClick={onCreateRoomButtonClicked}>
               <i className="material-icons">add_circle_outline</i>
               <span>방 만들기</span>
             </div>
             <RoomCreationDlg userInfo={userInfo} dlgIsOpen={dlgIsOpen} closeDlgCallBack={closeCreateRoomDlg} />

             <div className="header__right__element" onClick={onLogoutButtonClicked}>
               <i className="material-icons">logout</i>
               <span>로그아웃</span>
             </div>
             <Link to="/Profile">
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