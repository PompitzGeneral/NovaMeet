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

const RoomCreationDlg = ({ userInfo, roomInfo, dlgIsOpen, requestJoinRoom, closeDlgCallBack }) => {
  const [roomPassword, setRoomPassword] = useState('');

  const history = useHistory();
  useEffect(() => {
    // 첫 랜더링 시 발생하는 콜백
    //setIsOpen(pIsOpen);
    console.log(`RoomPasswordDlg, userInfo:`, userInfo);
  }, []);

  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setRoomPassword(value);
    console.log("onChange, roomPassword");
  };
  const onSubmit = async (event) => {
    event.preventDefault()
    console.log("onSubmit")
    requestJoinRoom(roomInfo, roomPassword)
  };

  return (
    <Dialog open={dlgIsOpen} onClose={closeDlgCallBack}>
      <form onSubmit={onSubmit} noValidate>
        <DialogTitle>패스워드 입력</DialogTitle>
        <DialogContent>
          <CssBaseline />
          <TextField
            label="패스워드 입력"
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
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="primary" type="submit">확인</Button>
          <Button variant="outlined" color="primary" onClick={closeDlgCallBack}>닫기</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default RoomCreationDlg;
