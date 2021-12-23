package com.company;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Vector;

public class Server implements SocketEvents {
    int port;
    ServerSocket serverSocket;
    Vector<TCPSession> sessions;

    static int tcpSessionID = 0;

    public Server(int port) {
        this.port = port;
        try {
            serverSocket = new ServerSocket(port);
            sessions = new Vector<TCPSession>();
            System.out.println("Push Message Server Started, Port:" + port);
            while (true) {
                var newSocket = serverSocket.accept();
                var session = new TCPSession(++tcpSessionID, newSocket, this);
                session.start();
                sessions.add(session);
            }
        } catch (IOException ioException) {
            ioException.printStackTrace();
        }
    }

    public static void main(String[] args) {
        new Server(40001);
    }

    @Override
    public void disconnected(TCPSession session) {
        System.out.println("Socket disconnected");
        sessions.remove(session);
    }

    @Override
    public void receivedData(int tcpSessionID, String msg) {
        System.out.println("received Message :" + msg);

        String[] fields = msg.split(";");
        var type = MessageType.REQUEST_JOIN.name();
        if ( fields[0].equals( MessageType.REQUEST_JOIN.name() ) ) {
            receivedJoinMessage(tcpSessionID, fields);
        } else if ( fields[0].equals( MessageType.REQUEST_CURRENT_USERS.name() ) ) {
            receivedCurrentUsersMessage(tcpSessionID);
        } else if ( fields[0].equals( MessageType.REQUEST_PUSH_MESSAGE.name() ) ) {
            receivedRequestPushMessage(tcpSessionID, fields);
        } else {
            System.out.println("received unknown Message");
        }
    }

    // 클라이언트로부터 유저 정보 수신.
    private void receivedJoinMessage(int tcpSessionID, String[] fields) {
        System.out.println("receivedJoinMessage");
        String userID = fields[1];
        String userDisplayName = fields[2];
        String userImageUrl = fields[3];

        for (TCPSession session : sessions) {
            if (session.getSessionID() == tcpSessionID) {
                session.setUserData(new UserData(userID, userDisplayName, userImageUrl));
                break;
            }
        }
    }
    // 현재 접속한 유저 정보 전송
    private void receivedCurrentUsersMessage(int tcpSessionID) {
        System.out.println("receivedCurrentUsersMessage");
        TCPSession targetSession = null;
        for (TCPSession session : sessions) {
            if (session.getSessionID() == tcpSessionID) {
                targetSession = session;
                break;
            }
        }
        sendCurrentUsersMessage(targetSession);
    }
    // 클라이언트로부터 푸시 메시지전달 요청 수신
    private void receivedRequestPushMessage(int tcpSessionID, String[] fields) {
        System.out.println("receivedRequestPushMessage");
        // messageName, RoomID
        String receiverUserID = fields[1];
        String roomID = fields[2];

        // 1. 메시지를 보낸 유저의 정보를 찾는다
        UserData senderUser = null;
        for (TCPSession session : sessions) {
            if (session.getSessionID() == tcpSessionID) {
                senderUser = session.getUserData();
                break;
            }
        }
        // 2. 보낼 상대방 유저의 세션을 찾는다.
        TCPSession targetSession = null;
        for (TCPSession session : sessions) {
            if (session.getUserData() == null)
                continue;

            if (session.getUserData().getUserID().equals(receiverUserID) ) {
                targetSession = session;
                break;
            }
        }

        if (senderUser == null || targetSession == null) {
            return;
        }

        // 3. 보낼 유저에게 푸시 메시지 전송.
        sendPushMessage(targetSession, senderUser, roomID);
    }
    // 상대방에게 푸시 메시지 전송
    private void sendPushMessage(TCPSession targetSession, UserData senderUserData, String roomID) {
        System.out.println("sendPushMessage");
        // messageName, userID, userDisplayName, userImageUrl, roomID
        String msg = MessageType.PUSH_MESSAGE.name() + ";"
                + senderUserData.getUserID() + ";"
                + senderUserData.getUserDisplayName() + ";"
                + senderUserData.getUserImageUrl() + ";"
                + roomID;

        targetSession.sendMessage(msg);
    }

    // 로그온 유저 상태 메시지 전송(브로드캐스트)
    private void sendCurrentUsersMessage(TCPSession targetSession) {
        System.out.println("sendCurrentUsersMessage");
        // messageName, userCount, userId...
        String msg = MessageType.RESPONSE_CURRENT_USERS.name() + ";" + sessions.size() + ";";
        for (TCPSession session : sessions) {
            // Todo Refactoring
            if (session.getUserData() != null) {
                msg += session.getUserData().getUserID();
                msg += "*";
                msg += session.getUserData().getUserDisplayName();
                msg += "*";
                msg += session.getUserData().getUserImageUrl();
                msg += ";";
            }
        }
        // 0에서 msg.length() - 1 길이까지 잘라냄 (마지막 ';' 제거)
        msg.substring(0, msg.length() - 1);
        targetSession.sendMessage(msg);
    }
}
