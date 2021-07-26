import React, { useState, useEffect } from "react";
import AppRouter from "components/Router";
import Header from "components/Header";
import "components/App.css"

function App() {

  // 로그인 상태 관리
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('user_id') === null) {
      // sessionStorage 에 user_id 라는 key 값으로 저장된 값이 없다면
      console.log('App - useEffect(sessionStorage.getItem === null), isLogin : ', isLogin)
    } else {
      // sessionStorage 에 user_id 라는 key 값으로 저장된 값이 있다면
      // 로그인 상태 변경
      setIsLogin(true)
      console.log('App - useEffect(sessionStorage.getItem !== null), isLogin : ', isLogin)
    }
  })

  return (
    <>
    {console.log(`App Rendered, isLogin : ${isLogin}`)}
        {/* <Header isLogin={isLogin}/> */}
        <AppRouter isLogin={isLogin}/>
      {/* <footer> &copy; {new Date().getFullYear()} NovaMeet Footer </footer> */}
    </>
  );
}

export default App;
