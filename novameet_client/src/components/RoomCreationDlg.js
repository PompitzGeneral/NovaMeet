import React, { useState, useEffect } from "react";
import {useHistory } from 'react-router-dom';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import "components/RoomCreationDlg.css"
import axios from 'axios';

const RoomCreationDlg = ({ userInfo, dlgIsOpen, closeDlgCallBack }) => {
  const [roomName, setRoomName] = useState('');
  const [currentFile, setCurrentFile] = useState(undefined);
  const [previewImage, setPreviewImage] = useState(undefined);
  const [roomPassword, setRoomPassword] = useState('');
  const [roomMemberMaxCount, setRoomMemberMaxCount] = useState(2);

  const history = useHistory();
  useEffect(() => {
    // 첫 랜더링 시 발생하는 콜백
    //setIsOpen(pIsOpen);
    console.log(`RoomCreationDlg, userInfo:`, userInfo);
  }, []);

  const onChange = (event) => {
    const {
      target: { name, value },
    } = event;
    switch (name) {
      case "roomName":
        setRoomName(value);
        console.log("onChange, roomName");
        break;
      case "roomPassword":
        setRoomPassword(value);
        console.log("onChange, roomPassword");
        break;
      case "roomMemberMaxCount":
        value < 0 ? setRoomMemberMaxCount(0) : setRoomMemberMaxCount(value);
        console.log("onChange, roomMemberMaxCount");
        break;
      default:
        break;
    }
  };
  const onSubmit = async (event) => {
    event.preventDefault();
    console.log("onSubmit");

    let formData = new FormData();

    const config = {
      header: { 'content-type': 'multipart/form-data' },
    };

    console.log("roomOwnerInfo");
    console.log(userInfo);
    formData.append('roomID', roomName);
    formData.append('roomOwner', userInfo.userID);
    formData.append('roomThumbnail', currentFile);
    formData.append('roomPassword', roomPassword);
    formData.append('roomMemberMaxCount', roomMemberMaxCount);
    console.log("formData:", formData);

    axios.post('/api/createRoom', formData, config)
      .then(res => {
        console.log(res);
        console.log(`res.data.responseCode : ${res.data.responseCode}`);
        if (res.data.responseCode === 1) {
          console.log("방 생성 완료");
          alert('방 생성 완료');
          closeDlgCallBack();
          history.push({
            pathname:`/Chatroom/${roomName}`, 
            state: {userInfo: userInfo, isRoomOwner: true}
          });
        } else if (res.data.responseCode === 0) {
          alert('이미 같은 이름의 방이 존재합니다.');
        } else {
          alert('방 생성 예외 케이스. Server Log 확인 필요');
        }
      })
      .catch();
  };

  const onSelectFile = (event) => {
    console.log(event.target.files[0]);
    console.log(URL.createObjectURL(event.target.files[0]));
    setCurrentFile(event.target.files[0]);
    setPreviewImage(URL.createObjectURL(event.target.files[0]));
  }

  return (

    <Dialog open={dlgIsOpen} onClose={closeDlgCallBack}>
      <form onSubmit={onSubmit} noValidate>
        <DialogTitle>방 생성</DialogTitle>
        <DialogContent>
          <CssBaseline />

          {/* <Typography component="h1" variant="h5">방 이름</Typography> */}
          <TextField
            label="방 이름"
            value={roomName}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            type="text"
            id="roomName"
            name="roomName"
            autoFocus
            autoComplete="off"
            onChange={onChange} />
          <Typography component="h1" variant="h5">대표 이미지</Typography>
          <label htmlFor="btn-upload">
            <input
              id="btn-upload"
              name="btn-upload"
              style={{ display: 'none' }}
              type="file"
              accept="image/*"
              onChange={onSelectFile} />
            <Button variant="outlined" color="primary" component="span">
              이미지 선택
            </Button>
          </label>
          <Card>
            <CardContent>
              <img className="thumbnail" src={previewImage} alt="" />
            </CardContent>
          </Card>

          {/* <Typography component="h1" variant="h5">비밀번호</Typography> */}
          <TextField
            label="비밀번호"
            value={roomPassword}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="roomPassword"
            type="password"
            id="roomPassword"
            inputProps={{
              autocomplete: 'new-password',
              form: {
                autocomplete: 'off',
              },
            }}
            onChange={onChange} />
          {/* <Typography component="h1" variant="h5">인원수</Typography> */}
          <TextField
            label="인원수"
            value={roomMemberMaxCount}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="roomMemberMaxCount"
            type="number"
            id="roomMemberMaxCount"
            autoComplete="off"
            onChange={onChange} />
        </DialogContent>
        <DialogActions>
          {/* color="primary" */}
          {/* variant= contained, outlined */}
          <Button variant="outlined" color="primary" type="submit">생성</Button>
          <Button variant="outlined" color="primary" onClick={closeDlgCallBack}>닫기</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default RoomCreationDlg;
