import React, { useState, useEffect } from "react";
import AppRouter from "components/Router";
import Header from "components/Header";
import "components/App.css"

function App() {

  // 로그인 상태 관리
  const [isLogin, setIsLogin] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email:'',
    displayName:'' 
    });

  useEffect(() => {
    const userEmail = sessionStorage.getItem('user_id');
    if (sessionStorage.getItem('user_id') === null) {
    // if (localStorage.getItem('user_id') === null) {
      // sessionStorage 에 user_id 라는 key 값으로 저장된 값이 없다면
      console.log('App - useEffect(sessionStorage.getItem === null), isLogin : ', isLogin);

    } else {
      // sessionStorage 에 user_id 라는 key 값으로 저장된 값이 있다면
      // 로그인 상태 변경
      setIsLogin(true);

      if ((userInfo.email !== userEmail) || (userInfo.displayName !== userEmail)) {
        setUserInfo({
          email: userEmail,
          displayName: userEmail
        });
      }
      
      console.log('App - useEffect(sessionStorage.getItem !== null), isLogin : ', isLogin);
      console.log('App - useEffect(sessionStorage.getItem !== null), userInfo : ');
      console.log(userInfo);
    }
  })

  return (
    <>
    {console.log(`App Rendered, isLogin : ${isLogin}`)}
        {/* <Header isLogin={isLogin}/> */}
        <AppRouter isLogin={isLogin} userInfo={userInfo}/>
      {/* <footer> &copy; {new Date().getFullYear()} NovaMeet Footer </footer> */}
    </>
  );
}

export default App;
