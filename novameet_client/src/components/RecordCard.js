import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import "./RecordCard.css"
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  TextField,
  Typography
} from "@material-ui/core";

const padNumber = (num, length) => {
  return String(num).padStart(length, '0');
};

const getAMPM = (hours) => {
  return (hours >= 12) ? 'PM' : 'AM'
}

const getAMPMHours = (hours) => {
  hours = hours % 12
  return hours ? hours : 12 // the hour '0' should be '12'
}

let gUserFocusTime = 0
const RecordCard = ({userInfo, refreshUserInfo}) => {
  console.log("[RecordCard] userInfo :", userInfo)
  let now = new Date();
  const [currentDateString, setCurrentDateString] = 
    useState(`${padNumber(now.getFullYear(), 2)}-${padNumber(now.getMonth(), 2)}-${padNumber(now.getDay(), 2)}`);
  const [currentTimeString, setCurrentTimeString] = 
    useState(`${getAMPM(now.getHours())} ${padNumber(getAMPMHours(now.getHours()), 2)} : ${padNumber(now.getMinutes(), 2)} : ${padNumber(now.getSeconds(), 2)}`);
  const [userFocusTimeString, setUserFocusTimeString] = 
    useState(`
      ${padNumber(parseInt(userInfo.dailyFocusTime / 60 / 60), 2)} : 
      ${padNumber(parseInt((userInfo.dailyFocusTime / 60) % 60), 2)} : 
      ${padNumber(parseInt(userInfo.dailyFocusTime % 60), 2)}
    `);
  const [isRecordStarted, setIsRecordStarted] = useState(false)
  // useRef는 값이 변하더라도 리렌더링을 발생시키지 않음
  const nowDateTimeInterval = useRef(null);
  const focusTimeInterval = useRef(null);

  useEffect(() => {
    console.log("[RecordCard] onCreated");
    console.log("[RecordCard] userInfo", userInfo);
    gUserFocusTime = userInfo.dailyFocusTime
    // 1초에 한번씩 반복
    nowDateTimeInterval.current = setInterval(() => {
      now = new Date();
      setCurrentDateString(`${padNumber(now.getFullYear(), 2)}-${padNumber(now.getMonth(), 2)}-${padNumber(now.getDay(), 2)}`)
      setCurrentTimeString(`${getAMPM(now.getHours())} ${padNumber(getAMPMHours(now.getHours()), 2)} : ${padNumber(now.getMinutes(), 2)} : ${padNumber(now.getSeconds(), 2)}`)
    }, 1000);
    // 컴포넌트가 마운트 해제되는 시점에 타이머를 해제한다.
    // 그렇지 않으면, 타이머는 비동기로 진행되기 때문에 
    // 컴포넌트가 마운트 해제되더라도 타이머는 없어지지 않는 상황이 발생 할 수 있음
    return () => { 
      console.log("[RecordCard] onDestroy");
      clearInterval(nowDateTimeInterval.current)
      clearInterval(focusTimeInterval.current)
      nowDateTimeInterval.current = null
      focusTimeInterval.current = null
      axios.post('/api/updateDailyFocusTime',
        {
          'userIdx': userInfo.userIdx,
          'dailyFocusTime': gUserFocusTime
        },
        null
      )
        .then(res => {
          console.log("[RecordCard] updateDailyFocusTime success")
          refreshUserInfo();
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }, [])

  const onRecordStartButtonClicked = (e) => {
    console.log("[RecordCard] onRecordStartButtonClicked");
    console.log("[RecordCard] isRecordStarted:", isRecordStarted);
    if (!isRecordStarted && !focusTimeInterval.current) {
      focusTimeInterval.current = setInterval(() => {
        gUserFocusTime++;
        setUserFocusTimeString(`
          ${padNumber(parseInt(gUserFocusTime / 60 / 60) , 2)} : 
          ${padNumber(parseInt((gUserFocusTime / 60) % 60), 2)} : 
          ${padNumber(parseInt(gUserFocusTime % 60), 2)}
        `)
        console.log("[RecordCard] userFocusTime :", gUserFocusTime)
      }, 1000); 
      setIsRecordStarted(!isRecordStarted)
    } else {
      alert("이미 집중시간 체크중입니다.")
    }
  }

  const onRecordStopButtonClicked = () => {
    console.log("[RecordCard] onRecordStopButtonClicked");
    console.log("[RecordCard] isRecordStarted:", isRecordStarted);
    if(isRecordStarted) {
      clearInterval(focusTimeInterval.current)
      focusTimeInterval.current = null
      setIsRecordStarted(!isRecordStarted)
    }
  }

  return (
    <>
      {/* <Typography componet="h2" variant="h5" gutterBottom>
        Cards
      </Typography> */}
      <Card elevation={10} style={{width:220}}>
        <CardContent>
          {/* <Typography className="dateTypography" variant="h5" component="p">
            {currentDateString}  <br />
          </Typography>
          <Typography className="timeTypography" variant="h5" component="p">
            {currentTimeString}  <br />
          </Typography>
          <br/ > */}
          <Typography className="todayFocusTimeTypography" variant="h5" component="p">
            Daily Focus Time  <br />
          </Typography>
          <br/ >
          <Typography className="todayFocusTimeTypography" variant="h6" component="p">
            {userFocusTimeString}
          </Typography>
        </CardContent>
        <CardActions>
          <Button variant="contained" color="primary" onClick={onRecordStartButtonClicked} disabled={isRecordStarted}>
            기록 시작
          </Button>
          <Button variant="contained" color="primary" onClick={onRecordStopButtonClicked} disabled={!isRecordStarted}>
            기록 중지
          </Button>
        </CardActions>
      </Card>
    </>
  )
};

export default RecordCard;
