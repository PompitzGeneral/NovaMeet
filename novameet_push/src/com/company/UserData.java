package com.company;

public class UserData {
    private String userID;
    private String userDisplayName;
    private String userImageUrl;

    public UserData(String userID, String userDisplayName, String userImageUrl) {
        this.userID = userID;
        this.userDisplayName = userDisplayName;
        this.userImageUrl = userImageUrl;
    }

    public String getUserID() {
        return this.userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }

    public String getUserDisplayName() {
        return this.userDisplayName;
    }

    public void setUserDisplayName(String userDisplayName) {
        this.userDisplayName = userDisplayName;
    }

    public String getUserImageUrl() {
        return this.userImageUrl;
    }

    public void setUserImageUrl(String userImageUrl) {
        this.userImageUrl = userImageUrl;
    }
}
