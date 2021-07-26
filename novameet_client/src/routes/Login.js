import React, { useState, useEffect } from "react";
import "routes/Login.css"
import axios from 'axios';

const Login = () => {

  const [inputID, setInputID] = useState('');
  const [inputPW, setInputPW] = useState('');

  useEffect(() => {
    // 첫 랜더링 시 발생하는 콜백
  }, 
  []);

  // input data 의 변화가 있을 때마다 value 값을 변경해서 useState 해준다
  const handleInputID = (e) => {
    if (e.target.value.length < 70) {
      setInputID(e.target.value)
    }
  } 

  const handleInputPW = (e) => {
    if (e.target.value.length < 30) {
      setInputPW(e.target.value)
    }
  }

   //이메일 유효성 검사 함수
   const checkEmailPattern = (str) => {
    var regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
    return regExp.test(str) ? true : false;
  };

  //Todo. 특수문자 추가
  //패스워드 유효성 검사 함수(영문,숫자 혼합 8~30)
  const checkPasswordPattern = (str) => {
    var reg_pwd = /^.*(?=.{8,30})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
    return !reg_pwd.test(str) ? false : true;
  };

  const onLoginButtonClicked = () => {
    console.log("login request Button Clicked");

    if (!checkEmailPattern(inputID)) {
      alert("이메일 형식이 유효하지 않습니다.");
      return;
    }

    if (!checkPasswordPattern(inputPW)) {
      alert("패스워드 형식이 유효하지 않습니다.(영문,숫자를 혼합하여 8~30자)");
      return;
    }

    axios.post('/api/login', null, {
      params: {
        'user_id': inputID,
        'user_pw': inputPW
        }
    })
      .then(res => {
        console.log(res);
        console.log(`res.data.user_id : ${res.data.user_id}`);
        console.log(`res.data.user_displayname : ${res.data.user_displayname}`);
        console.log(`res.data.msg : ${res.data.msg}`);
        if (res.data.user_id === undefined) {
          // id 일치하지 않는 경우 userId = undefined, msg = '입력하신 id 가 일치하지 않습니다.'
          console.log('======================', res.data.msg);
          alert('Email가 존재하지 않습니다.');
        } else if (res.data.user_id === null) {
          console.log('======================', '패스워드를 확인해 주세요');
          alert('패스워드를 확인해 주세요');
        } else if (res.data.user_id === inputID) {
          console.log('======================', '로그인 성공');
          sessionStorage.setItem('user_id', inputID);
          // 작업 완료 되면 페이지 이동(새로고침)
          document.location.href = '/';
        } else {
          console.log('======================', '로그인 else');
        }
        
      })
    .catch();
  };

  const onRegisterButtonClicked = () => {
    console.log("register page Button Clicked");    
  };

  // Todo. 추후 Input Tab으로 리팩토링 해보기
  return (
    <div className="loginPage" style={{ justifyContent: "center", marginTop: 50 }}>
      <h2>Login</h2>
        <div >
          <label htmlFor='input_id'>이메일</label>
          <input type='text' className='textInput' value={inputID} onChange={handleInputID} />
        </div>
        <div>
          <label htmlFor='input_pw'>패스워드</label>
          <input type='password' className='textInput' value={inputPW} onChange={handleInputPW} />
        </div>
        <div>
          <button type='button' className='textInput submitButton' onClick={onLoginButtonClicked}>로그인</button>
        </div>
        <div>
          <button type='button' className='textInput submitButton' onClick={onRegisterButtonClicked}>회원가입</button>
        </div>
    </div>
  );
};
export default Login;
