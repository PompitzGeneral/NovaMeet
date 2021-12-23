package com.company;

public interface SocketEvents {
    void receivedData(int sessionID, String msg);
    void disconnected(TCPSession session);
}
