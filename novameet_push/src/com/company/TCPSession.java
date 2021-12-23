package com.company;

import java.io.*;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

public class TCPSession extends Thread {
    private int sessionID;
    private Socket socket;
//    private DataInputStream inputStream;
//    private DataOutputStream outputStream;
    private InputStream inputStream;
    private OutputStream outputStream;
    private SocketEvents events;
    private UserData userData;

    public TCPSession(int sessionID, Socket socket, SocketEvents events) {
        this.sessionID = sessionID;
        this.socket = socket;
        this.events = events;

        try {
//            inputStream  = new DataInputStream(socket.getInputStream());
//            outputStream = new DataOutputStream(socket.getOutputStream());
            inputStream  = socket.getInputStream();
            outputStream = socket.getOutputStream();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public int getSessionID() {
        return this.sessionID;
    }

    public void setSessionID(int sessionID) {
        this.sessionID = sessionID;
    }

    public UserData getUserData() {
        return this.userData;
    }

    public void setUserData(UserData userData) {
        this.userData = userData;
    }

    public void sendMessage(String msg) {
        try {
            //outputStream.writeUTF(msg);
            outputStream.write(msg.getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void run() {
        try {
            System.out.println("TCP Session Running");
            while (true) {
                // 소켓에서 데이터 수신
//                String msg = inputStream.readUTF();
                var bytes = new byte[200];
                int byteCount = inputStream.read(bytes);
                String msg = new String(bytes, 0, byteCount, "UTF-8");
                events.receivedData(this.sessionID, msg);
            }
        } catch (Exception e) {
            //e.printStackTrace();
        } finally {
            // 소켓 연결종료 이벤트 발생
            events.disconnected(this);
            try {
                socket.close();
            } catch (IOException ioException) {
                ioException.printStackTrace();
            }
        }
    }
}

