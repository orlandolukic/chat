<?php 

	$sql  = mysqli_query($CHAT, "SELECT * FROM ".CHAT_DB_TBL_USERS." WHERE BINARY ".CHAT_DB_F_USERNAME."='".$_SESSION['username']."'");	
	$USER = mysqli_fetch_object($sql);
	mysqli_free_result($sql);

    // Check if user exists
    $SHOULD_REDIRECT_TO_LOGOUT = false;
    if (isset($_SESSION['username']) && !$USER) {
        $CHAT_ALLOW_INIT = false;
        $CHAT_ERROR_INIT = "Username '" .$_SESSION['username'] . "' does not exist.";
        $SHOULD_REDIRECT_TO_LOGOUT = true;
    }

?>