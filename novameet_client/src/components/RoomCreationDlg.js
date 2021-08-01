import React, { useState, useEffect } from "react";

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import "components/RoomCreationDlg.css"
import axios from 'axios';

const RoomCreationDlg = ({ dlgIsOpen, createRoomCallBack, closeDlgCallBack }) => {
  const [roomName, setRoomName] = useState('');
  //Todo. 이미지 파일로 받는다
  const [roomImage, setRoomImage] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [roomMemberMaxCount, setRoomMemberMaxCount] = useState(2);

  useEffect(() => {
    // 첫 랜더링 시 발생하는 콜백
    //setIsOpen(pIsOpen);
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
      case "roomImage":
        setRoomImage(value);
        console.log("onChange, roomImage");
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
    
    createRoomCallBack(roomName, roomImage, roomPassword, roomMemberMaxCount);
  };

  return (
    
    <Dialog open={dlgIsOpen} onClose={closeDlgCallBack}>
    <form onSubmit={onSubmit} noValidate>
                    <DialogTitle>방 생성</DialogTitle>
                    <DialogContent>
                    <CssBaseline />
            <Grid container>
            <Grid item xs><Typography component="h1" variant="h5">방 이름</Typography></Grid>
            <Grid item>
              <TextField
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
                onChange={onChange}/>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs>
              <Typography component="h1" variant="h5">대표 이미지</Typography>
            </Grid>
            <Grid item>
              <TextField
                value={roomImage}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="roomImage"
                type="text"
                id="roomImage"
                autoComplete="off"
                onChange={onChange}
              />
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs><Typography component="h1" variant="h5">비밀번호</Typography></Grid>
            <Grid item>
              <TextField
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
                onChange={onChange}/>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs><Typography component="h1" variant="h5">인원수</Typography></Grid>
            <Grid item>
              <TextField
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
            </Grid>
          </Grid>
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
