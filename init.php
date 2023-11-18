<?php 
//	Enter settings for chat initialization
//	General settigns
	define("CHAT_AJAX_INTERVAL", 4);

//	Folder allocation
	define("SRC",                  "http://localhost/chat/");
	define("CHAT_IMAGES",          "http://localhost/chat/users/");
    define("AJAX_URL",            "http://localhost/chat/ajax/");
	define("IMAGE_FOLDER_PREPATH", "http://localhost/chat");

//	Database settings
	define("CHAT_DB_TYPE",     "localhost");
	define("CHAT_DB_USERNAME", "admin");
	define("CHAT_DB_PASSWORD", "lukaluka");
	define("CHAT_DB_NAME",     "chat");

//	Database tables
	define("CHAT_DB_TBL_USERS",      "users");
	define("CHAT_DB_TBL_ONLINE_IND", "online");
	define("CHAT_DB_TBL_TIMESTAMP",  "timestamp");
	define("CHAT_DB_TBL_COND",        NULL);
	define("CHAT_DB_TBL_IMAGE",      "profilepic");
	define("CHAT_DB_TBL_ALLOW_CODE", 1);
	define("CHAT_DB_TBL_MEMBERS",    "members");

//	Database Fields
	define("CHAT_DB_F_UID",        "userID");
	define("CHAT_DB_F_UNAME",      "name");
	define("CHAT_DB_F_USURNAME",   "surname");
	define("CHAT_DB_F_USERNAME",   "username");
	define("CHAT_DB_F_GID",        "groupID");
	define("CHAT_DB_F_FORCEOFFLINE","force_offline");

//	File names from AJAX
	if (defined("AJAX") && AJAX) 
	{
		define("CHAT_FILE_FUNCTIONS", "functions.php");
	}
//	File names
	define("CHAT_FILE_CONNECT_DB_CHAT" , "connectDBChat.php");
	define("CHAT_FILE_GET_USER_DATA" , "get_data.php");
	define("CHAT_FILE_PROFILE_PIC" ,      CHAT_IMAGES."default-profile-pic.png");
	define("CHAT_FILE_SESSIONS"  ,     "sessions.php");

//	Local constants
	define("CHAT_MSSG_PER_FETCH", 20);
	define("CHAT_POLL_SLEEP",     0.6);
	define("CHAT_POLL_MAX_NUMBER", 8000);



//	Global Variables
	$CHAT_ALLOW_INIT = true;
?>