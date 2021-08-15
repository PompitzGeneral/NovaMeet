import React, { useState, useEffect } from "react";
import axios from 'axios'

import "routes/Register.css"

const Register = () => {

  const [inputEmail, setInputEmail] = useState('');
  const [inputEmailAuth, setInputEmailAuth] = useState('');
  const [inputPW, setInputPW] = useState('');
  const [inputRePW, setInputRePW] = useState('');
  const [inputDisplayName, setInputDisplayName] = useState('');

  const [authNumber, setAuthNumber] = useState('');
  // 아래와 같이 변수로 놓을 시 다른 항목 입력하면서 Rendering 될 때 값이 초기화 됨
  // let authNumber = '';

  useEffect(() => {
    // 첫 랜더링 시 발생하는 콜백
  },
    []);

  // input data 의 변화가 있을 때마다 value 값을 변경해서 useState 해준다
  const handleInputEmail = (e) => {
    if (e.target.value.length < 70) {
      setInputEmail(e.target.value)
    }
  }

  const handleInputEmailAuth = (e) => {
    if (e.target.value.length < 7) {
      console.log(`test4 authNumber:${authNumber}`);
      setInputEmailAuth(e.target.value)
    }
  }

  const handleInputPW = (e) => {
    if (e.target.value.length < 30) {
      setInputPW(e.target.value)
    }
  }

  const handleInputRePW = (e) => {
    if (e.target.value.length < 30) {
      setInputRePW(e.target.value)
    }
  }

  const handleInputDisplayName = (e) => {
    if (e.target.value.length < 30) {
      setInputDisplayName(e.target.value)
    }
  }

  //이메일 유효성 검사 함수
  const checkEmailPattern = (str) => {
    var regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
    return regExp.test(str) ? true : false;
  };

  // 이메일 인증번호 체크
  const checkEmailAuth = (str) => {
    console.log(`checkEmailAuth, authNumber:${authNumber}, inputEmailAuth:${str}`);
    return (authNumber === str) ? true : false
  };

  //Todo. 특수문자 추가
  //패스워드 유효성 검사 함수(영문,숫자 혼합 8~30)
  const checkPasswordPattern = (str) => {
    var reg_pwd = /^.*(?=.{8,30})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
    return !reg_pwd.test(str) ? false : true;
  };

  //Todo. 특수문자 추가
  //닉네임 유효성 검사 함수(문자,숫자 2~30)
  const checkDisplayNamePattern = (str) => {
    var reg_displayname = /^[가-힣]{2,30}|[a-zA-Z]{2,30}\s|[a-zA-Z]{2,30}$/;
    return reg_displayname.test(str) ? true : false;
  }

  //이메일 인증 버튼 클릭
  const onEmailAuthButtonClicked = () => {

    const randNum = Math.random().toString().substr(2, 6);

    console.log(`Email Auth Button Clicked, user_email:${inputEmail}, auth_number:${randNum}`);
  
    // 시작시간 체크
    let start = new Date().getTime();  
    axios.post('/api/emailAuth', null, {
      params: {
        'user_email': inputEmail,
        'auth_number': randNum
      }
    })
      .then(res => {
        console.log(res);
        // 종료시간 체크
        let end = new Date().getTime(); 
        console.log(`이메일 인증번호 발송 요청-응답 소요시간 : ${(end-start)}ms`); 
        if (res.data.responseCode === 1) {
          alert(`입력된 이메일 주소로 인증번호를 발송했습니다.`);
          setAuthNumber(randNum);
        } else if (res.data.responseCode === 0){
          alert(`이미 사용중인 이메일 주소입니다.`);
          setAuthNumber('');
        } else if (res.data.responseCode === -1){
          alert(`인증번호 발송 실패. error message : ${res.data.msg}`);
          setAuthNumber('');
        } else {
          alert(`인증번호 발송 실패. error message : ${res.data.msg}`);
          setAuthNumber('');
        }
      })
      .catch()
  };

    // 회원가입 버튼 클릭
    const onRegisterButtonClicked = () => {
      console.log("register request Button Clicked");

      // Todo. 닉네임 존재 체크

      // Todo. Email 체크

      // 유효성 검사 진행
      if (!checkEmailPattern(inputEmail)) {
        alert("이메일 형식이 유효하지 않습니다.");
        return;
      }

      console.log(`test2 authNumber:${authNumber}`);

      /*
      if (!inputEmailAuth) {
        alert("이메일 인증 번호를 입력해 주세요");
        return;
      }

      if (!checkEmailAuth(inputEmailAuth)) {
        alert("이메일 인증 번호가 올바르지 않습니다");
        return;
      }

      if (!checkPasswordPattern(inputPW)) {
        alert("패스워드 형식이 유효하지 않습니다.(영문,숫자를 혼합하여 8~30자)");
        return;
      }

      if (inputPW !== inputRePW) {
        alert("패스워드가 일치하지 않습니다.");
        return;
      }

      if (!checkDisplayNamePattern(inputDisplayName)) {
        alert("닉네임 형식이 유효하지 않습니다.(한글,영문 2~30자)");
        return;
      }*/

      // 유효성 검사 통과하면 서버에 등록 요청
      axios.post('/api/register', null, {
        params: {
          'user_id': inputEmail,
          'user_pw': inputPW,
          'user_displayname': inputDisplayName
        }
      })
        .then(res => {
          console.log(res);
          if (res.data.responseCode === -1) {
            alert(`log 확인 필요`);
          } else if (res.data.responseCode === 0) {
            console.log('======================', res.data.msg);
            alert('이미 사용중인 Email 주소입니다.');
          } else if (res.data.responseCode === 1) {
            console.log('======================', '회원가입 성공');
            alert('회원가입이 정상적으로 완료되었습니다.');
            // Todo. 로그인 페이지로 이동
            document.location.href = '/';
          } else {
            console.log('======================', 'unkwon');
          }
        })
        .catch()
    };

    return (
      <div>
        <h2>회원가입</h2>
        <div>
          <label htmlFor='input_name'>닉네임</label>
          <input type='text' className='textInput' value={inputDisplayName} onChange={handleInputDisplayName}/>
        </div>
        <div>
          <label htmlFor='input_email'>이메일</label>
          <input type='text' className='textInput' value={inputEmail} onChange={handleInputEmail}/>
          <button type='button' className='textInput submitButton' onClick={onEmailAuthButtonClicked}>인증번호 발송</button>
        </div>
        <div>
          <label htmlFor='input_auth'>이메일 인증번호</label>
          <input type='text' className='textInput' value={inputEmailAuth} onChange={handleInputEmailAuth}/>
        </div>
        <div>
          <label htmlFor='input_pw'>패스워드</label>
          {/* autocomplete="new-password" */}
          <input type='password' className='textInput' value={inputPW} onChange={handleInputPW} inputProps={{
                  autocomplete: 'new-password',
                  form: {
                    autocomplete: 'off',
                  },
                }}/>
        </div>
        <div>
          <label htmlFor='input_pw'>패스워드 확인</label>
          {/* autocomplete="new-password" */}
          <input type='password' className='textInput' value={inputRePW} onChange={handleInputRePW} inputProps={{
                  autocomplete: 'new-password',
                  form: {
                    autocomplete: 'off',
                  },
                }}/>
        </div>

        <div>
          <button type='button' className='textInput submitButton' onClick={onRegisterButtonClicked}>회원가입</button>
        </div>
      </div>
    );
  };

export default Register;
