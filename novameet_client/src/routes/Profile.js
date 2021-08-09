import React, { useState, useEffect } from "react";

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
    },
    large: {
        width: theme.spacing(10),
        height: theme.spacing(10),
    },
}));

const Profile = ({ userInfo, refreshUserInfo }) => {

    const [currentFile, setCurrentFile] = useState(undefined);
    const [previewImage, setPreviewImage] = useState(undefined);
    const [userID, setUserID] = useState('');
    const [userDisplayName, setUserDisplayName] = useState('');
    const [userCurrentPassword, setUserCurrentPassword] = useState('');
    const [userNewPassword, setUserNewPassword] = useState('');
    const [userReNewPassword, setUserReNewPassword] = useState('');

    useEffect(() => {
        // Todo. UserImage 받아오기
        setPreviewImage(userInfo.userImageUrl);
        setUserID(userInfo.userID);
        setUserDisplayName(userInfo.userDisplayName);
    }, []);

    const onSelectFile = (event) => {
        console.log(event.target.files[0]);
        console.log(URL.createObjectURL(event.target.files[0]));
        setCurrentFile(event.target.files[0]);
        setPreviewImage(URL.createObjectURL(event.target.files[0]));
    }
    const onChange = (event) => {
        const {
            target: { name, value },
        } = event;
        switch (name) {
            case "userDisplayName":
                setUserDisplayName(value);
                console.log("onChange, userDisplayName");
                break;
            case "userCurrentPassword":
                console.log("onChange, userCurrentPassword");
                setUserCurrentPassword(value);
                break;
            case "userNewPassword":
                console.log("onChange, userNewPassword");
                setUserNewPassword(value);
                break;
            case "userReNewPassword":
                console.log("onChange, userReNewPassword");
                setUserReNewPassword(value);
                break;
            default:
                break;
        }
    };
    const onUserInfoSubmit = async (event) => {
        event.preventDefault();
        console.log("onUserInfoSubmit");

        if (!checkDisplayNamePattern(userDisplayName)) {
            alert("닉네임 형식이 유효하지 않습니다.(한글,영문 2~30자)");
            return;
        }

        let formData = new FormData();

        const config = {
            header: { 'content-type': 'multipart/form-data' },
        };
        formData.append('file', currentFile);
        formData.append('user_id', userID);
        formData.append('user_displayname', userDisplayName);

        axios.post('/api/updateUserInfo', formData, config)
            .then(res => {
                console.log(res);
                if (res.data.responseCode === 1) {
                    refreshUserInfo();
                    alert("회원정보가 정상적으로 변경되었습니다.");
                    console.log('Database 유저 정보 갱신 성공');
                } else if (res.data.responseCode === 0) {
                    alert("회원정보가 변경 실패.");
                    console.log('Database 유저 정보 갱신 실패');
                } else {
                    console.log('======================', 'unkwon');
                }
            });
    };

    const onNewPasswordSubmit = async (event) => {
        event.preventDefault();
        console.log("onNewPasswordSubmit");

        if (!checkPasswordPattern(userNewPassword)) {
            alert("변경하려는 패스워드 형식이 유효하지 않습니다.(영문,숫자를 혼합하여 8~30자)");
            return;
        }

        if (userNewPassword !== userReNewPassword) {
            alert("변경하려는 패스워드가 일치하지 않습니다.");
            return;
        }

        axios.post('/api/updateUserPassword', null, {
            params: {
                'user_id': userID,
                'user_password': userCurrentPassword,
                'user_new_password': userNewPassword
            }
        })
            .then(res => {
                console.log(res);
                if (res.data.responseCode === 1) {
                    console.log('패스워드 변경 성공');
                    alert("패스워드가 정상적으로 변경되었습니다.");
                    setUserCurrentPassword('');
                    setUserNewPassword('');
                    setUserReNewPassword('');
                } else if (res.data.responseCode === 0) {
                    console.log('패스워드가 틀렸습니다');
                    alert("패스워드가 틀렸습니다.");
                } else if (res.data.responseCode === -1) {
                    console.log('update error');
                } else {
                    console.log('======================', 'unkwon');
                }
            })
            .catch()
    };

    //닉네임 유효성 검사 함수(문자,숫자 2~30)
    const checkDisplayNamePattern = (str) => {
        var reg_displayname = /^[가-힣]{2,30}|[a-zA-Z]{2,30}\s|[a-zA-Z]{2,30}$/;
        return reg_displayname.test(str) ? true : false;
    }

    //패스워드 유효성 검사 함수(영문,숫자 혼합 8~30)
    const checkPasswordPattern = (str) => {
        var reg_pwd = /^.*(?=.{8,30})(?=.*[0-9])(?=.*[a-zA-Z]).*$/;
        return !reg_pwd.test(str) ? false : true;
    };

    const classes = useStyles();
    return (
        <Container component="main" maxWidth="xs">
            <div>
                <form onSubmit={onUserInfoSubmit} noValidate>
                    <CssBaseline />
                    <Typography component="h1" variant="h5">회원 정보</Typography>
                    <label htmlFor="btn-upload">
                        <input
                            id="btn-upload"
                            name="btn-upload"
                            style={{ display: 'none' }}
                            type="file"
                            accept="image/*"
                            onChange={onSelectFile} />
                        <Avatar alt="Remy Sharp" src={previewImage} className={classes.large} />
                    </label>
                    <TextField
                        value={userID}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        type="text"
                        id="userID"
                        name="userID"
                        label="이메일"
                        disabled
                        autoComplete="off"
                    />
                    <TextField
                        value={userDisplayName}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        type="text"
                        id="userDisplayName"
                        name="userDisplayName"
                        label="닉네임"
                        autoComplete="off"
                        onChange={onChange} />

                    <Button variant="contained" type="submit">회원정보 변경</Button>
                </form>
            </div>
            <br />
            <Divider />
            <br />
            <div>
                <form onSubmit={onNewPasswordSubmit} noValidate>
                    <CssBaseline />
                    <Typography component="h1" variant="h5">패스워드 변경</Typography>
                    <TextField
                        value={userCurrentPassword}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="userCurrentPassword"
                        type="password"
                        id="userCurrentPassword"
                        label="현재 패스워드"
                        inputProps={{
                            autocomplete: 'new-password',
                            form: {
                                autocomplete: 'off',
                            },
                        }}
                        onChange={onChange}
                    />
                    <TextField
                        value={userNewPassword}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="userNewPassword"
                        type="password"
                        id="userNewPassword"
                        label="변경할 패스워드"
                        inputProps={{
                            autocomplete: 'new-password',
                            form: {
                                autocomplete: 'off',
                            },
                        }}
                        onChange={onChange}
                    />
                    <TextField
                        value={userReNewPassword}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        type="password"
                        id="userReNewPassword"
                        name="userReNewPassword"
                        label="변경할 패스워드 재입력"
                        inputProps={{
                            autocomplete: 'new-password',
                            form: {
                                autocomplete: 'off',
                            },
                        }}
                        onChange={onChange} />
<Button variant="contained" type="submit">패스워드 변경</Button>                
                </form>
            </div>
        </Container>
    );
}

export default Profile;