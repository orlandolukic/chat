<?php 

	error_reporting(E_DEPRECATED);
	$CHAT = mysqli_connect(CHAT_DB_TYPE, CHAT_DB_USERNAME, CHAT_DB_PASSWORD, CHAT_DB_NAME);

//	Test query
	$sql1 = mysqli_query($CHAT, "SELECT * FROM users WHERE 1");
	$sql2 = mysqli_query($CHAT, "SELECT * FROM settings WHERE 1");
	$sql3 = mysqli_query($CHAT, "SELECT * FROM members WHERE 1");

	mysqli_query($CHAT, "SET NAMES UTF8");

	if (mysqli_connect_errno() || !$sql1 || !$sql2 || !$sql3 || !isset($_SESSION['username']))
	{
	  $CHAT_ALLOW_INIT = false;
	  switch(true)
	  {
	  	 case mysqli_connect_errno(): $CHAT_ERROR_INIT = mysqli_connect_error(); break;
	  	 case (!isset($_SESSION['username'])): $CHAT_ERROR_INIT = "Username is not set."; break;
	  	 case (!$sql1): $CHAT_ERROR_INIT = "Table 'users' doesn't exist."; break;
	  	 case (!$sql2): $CHAT_ERROR_INIT = "Table 'settings' doesn't exist."; break;
	  	 case (!$sql3): $CHAT_ERROR_INIT = "Table 'member' doesn't exist."; break;
	  }
	}

?>