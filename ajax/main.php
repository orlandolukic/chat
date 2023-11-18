<?php 
	session_start();
	define("AJAX", true);
	include "../init.php";
	include "../".CHAT_FILE_CONNECT_DB_CHAT;
	include "../".CHAT_FILE_FUNCTIONS;
	include "../".CHAT_FILE_GET_USER_DATA;
	_check_system();

//	Init main.php
	$ACTION   = base64_decode($_POST['action']);
	$info     = array("response" => true, "exit" => false, "exitMssg" => NULL);
	$payload  = array();
	$RESPONSE = array("info" => &$info, "payload" => &$payload);

	switch($ACTION)
	{
	case "init":
		$payload["interval"] = CHAT_AJAX_INTERVAL;

		// Delete typing for current user
		$sql = mysqli_query($CHAT, "DELETE FROM typing WHERE BINARY senderID = '".$USER->userID."'");

	//	Get users for init
		$sql = mysqli_query($CHAT, "SELECT DISTINCT ".CHAT_DB_F_GID." FROM ".CHAT_DB_TBL_MEMBERS." WHERE ".CHAT_DB_F_USERNAME." = '".$_SESSION['username']."'");
		$p = "";
		$i = 0;
		while($t = mysqli_fetch_array($sql))
		{
			$p .= ($i>0 ? " OR " : "").CHAT_DB_F_GID." = ".$t[CHAT_DB_F_GID];
			$i++;
		};
		mysqli_free_result($sql);

		$sql = mysqli_query($CHAT, "SELECT * FROM (SELECT DISTINCT ".CHAT_DB_F_UID.", ".CHAT_DB_F_UNAME.", ".CHAT_DB_F_USURNAME." , `".CHAT_DB_TBL_USERS."`.`".CHAT_DB_F_USERNAME."`, CONCAT('".CHAT_IMAGES."',".CHAT_DB_TBL_IMAGE.") AS image, ".CHAT_DB_TBL_TIMESTAMP.", online, ".CHAT_DB_F_FORCEOFFLINE.", sex FROM (SELECT * FROM ".CHAT_DB_TBL_MEMBERS." WHERE ".CHAT_DB_F_USERNAME." != '".($_SESSION['username'])."' AND (".$p.")) tbl1 INNER JOIN `".CHAT_DB_TBL_USERS."` ON ".CHAT_DB_TBL_USERS.".".CHAT_DB_F_USERNAME." =  `tbl1`.".CHAT_DB_F_USERNAME.") tbl2");
		$arr = array(); 
		$x = $counter = 0;
		$t = time();	
		while ($obj = mysqli_fetch_assoc($sql))
		{	
			$arr[$x] = array("name"    => $obj[CHAT_DB_F_UNAME],
			                 "surname" => $obj[CHAT_DB_F_USURNAME],
			                 "uid"     => $obj[CHAT_DB_F_UID],
			                 "sex"     => intval($obj["sex"]),			                 
			                 "picture" => ($obj["image"] ? $obj["image"] : CHAT_FILE_PROFILE_PIC));
		
			$arr[$x]["online"] = is_online($obj["online"], $obj[CHAT_DB_F_FORCEOFFLINE], $obj[CHAT_DB_TBL_TIMESTAMP], $obj[CHAT_DB_F_UID]);
			$arr[$x]["online"]===1 ? $counter++ : NULL;
			$x++;
		}
		mysqli_free_result($sql);
		// @GLOBAL VARIABLES
		$payload["active_users"]   = $counter;
		$payload["users"]          = $arr;
		$payload["timestamp"]      = time();
		$payload["myID"]           = $USER->userID;
		$payload["sex"]            = intval($USER->sex);
		$payload["force_offline"]  = intval($USER->force_offline);
		$payload["sound"]          = (bool) $USER->sound_effect;
		$payload["fetch_mssg_lim"] = CHAT_MSSG_PER_FETCH;

		// Fetch active users
		// @ACITVE_CHAT_HEADS
		include "../sql/active_chat_heads.php";

		// Delete all old append_messages
		$sql = mysqli_query($CHAT, "DELETE FROM append_messages WHERE BINARY receiverID = '".$USER->userID."'");

		// Fetch messages for active chat heads
		if ($active_users > 0)
		{
			$b = &$payload["active_chat_heads"];
			include "../sql/fetch_messages.php";				
		};
		break;

	case "chat_refresh":
		//	Get users for init
		$sql = mysqli_query($CHAT, "SELECT DISTINCT ".CHAT_DB_F_GID." FROM ".CHAT_DB_TBL_MEMBERS." WHERE ".CHAT_DB_F_USERNAME." = '".$_SESSION['username']."'");
		$p = "";
		$i = 0;
		while($t = mysqli_fetch_array($sql))
		{
			$p .= ($i>0 ? " OR " : "").CHAT_DB_F_GID." = ".$t[CHAT_DB_F_GID];
			$i++;
		};
		mysqli_free_result($sql);

		$sql = mysqli_query($CHAT, "SELECT * FROM (SELECT ".CHAT_DB_F_UID.", ".CHAT_DB_TBL_TIMESTAMP.", online, ".CHAT_DB_F_FORCEOFFLINE." FROM (SELECT * FROM ".CHAT_DB_TBL_MEMBERS." WHERE ".CHAT_DB_F_USERNAME." != '".($_SESSION['username'])."' AND (".$p.")) tbl1 INNER JOIN `".CHAT_DB_TBL_USERS."` ON ".CHAT_DB_TBL_USERS.".".CHAT_DB_F_USERNAME." =  `tbl1`.".CHAT_DB_F_USERNAME.") tbl2");
		$arr = array(); 
		$x = $counter = 0;
		$t = time();		
		while ($obj = mysqli_fetch_assoc($sql))
		{	
			switch(true)
			{
			case ( $obj["online"]==1 && ($t - intval($obj[CHAT_DB_TBL_TIMESTAMP])  < 8 * CHAT_AJAX_INTERVAL ) && $obj[CHAT_DB_F_FORCEOFFLINE]==0 ): $arr[$x]["online"] = 1; break;
			case ( (intval($obj[CHAT_DB_F_FORCEOFFLINE])===1 || ($t - intval($obj[CHAT_DB_TBL_TIMESTAMP])  >= 8 * CHAT_AJAX_INTERVAL ))): $arr[$x]["online"] = 0; break;
			default: $arr[$x]["online"] = 0;
			}
			$arr[$x]["uid"] = $obj[CHAT_DB_F_UID];
			$arr[$x]["online"]===1 ? $counter++ : NULL;
			$x++;
		}
		mysqli_free_result($sql);
		$payload["active_users"] = $counter;
		$payload["chat_refresh"]  = $arr;
		$payload["timestamp"] = time();

		// Check typing
		$sql = mysqli_query($CHAT, "SELECT `typing`.senderID FROM typing  INNER JOIN active_chat_heads ON `typing`.receiverID = `active_chat_heads`.senderID AND `typing`.`senderID` = active_chat_heads.receiverID WHERE `typing`.receiverID = '".$USER->userID."'");
		$arr = array(); $i = 0;
		while($t = mysqli_fetch_object($sql)) $arr[$i++] = $t->senderID;
		$payload["typing"] = $arr;
		mysqli_free_result($sql);

		// Fetch active users
		//$sql = mysqli_query($CHAT, "SELECT receiverID AS uid, last_sent, outside, minimized FROM active_chat_heads WHERE BINARY senderID = '".$USER->userID."'");

		// Fetch new messages
		$sql = mysqli_query($CHAT, "SELECT apID AS messageID, message, date, timestamp, DAY(date) AS day_mssg, senderID FROM append_messages WHERE BINARY receiverID = '".$USER->userID."'");
		if (mysqli_num_rows($sql))
		{
			$messages = array(); $i = 0;
			while( $t = mysqli_fetch_object($sql) )
			{
				$t->time = date("H:i", $t->timestamp);
				$t->message = html_entity_decode($t->message, ENT_QUOTES);
				$messages[$i++] = $t;
			};
		}
		$payload["fetch"] = array("i" => (bool) mysqli_num_rows($sql), "messages" => !mysqli_num_rows($sql) ? NULL : $messages);
		// Delete new messages from chat buffer
		$sql = mysqli_query($CHAT, "DELETE FROM append_messages WHERE BINARY receiverID = '".$USER->userID."'");		

		break;

	case "setTypingForChatHead":
		$sql = mysqli_query($CHAT, "SELECT * FROM typing WHERE BINARY senderID = '".$USER->userID."' AND BINARY receiverID = '".$_POST['uid']."'");
		if (!mysqli_num_rows($sql)) 
		{
			mysqli_free_result($sql);
			$sql = mysqli_query($CHAT, "INSERT INTO typing (senderID, receiverID) VALUES ('".$USER->userID."','".$_POST['uid']."')");			
		}
		mysqli_free_result($sql);
		$payload = NULL;
		break;

	case "clearTypingForChatHead":
		$sql = mysqli_query($CHAT, "DELETE FROM typing WHERE BINARY senderID = '".$USER->userID."' AND receiverID = '".$_POST['uid']."'");
		$payload = NULL;
		break;

	case "sendMessage":
		_check_params("POST", ["message", "uid"]);
		$message = htmlentities($_POST['message'], ENT_QUOTES);

		// Add message to append_messages
		$sql = mysqli_query($CHAT, "INSERT INTO append_messages(message, date, timestamp, seen, senderID, receiverID, message_type) VALUES ('".$message."', '".date("Y-m-d")."', '".time()."', 0, '".$USER->userID."', '".$_POST['uid']."', 0)");

		// Add message to conversation
		$sql = mysqli_query($CHAT, "INSERT INTO messages(message, date, timestamp, seen, senderID, receiverID, message_type) VALUES ('".$message."', '".date("Y-m-d")."', '".time()."', 0, '".$USER->userID."', '".$_POST['uid']."', 0)");

		// Update new messages, when chat head is minimized or it's outside
		$sql = mysqli_query($CHAT, "UPDATE active_chat_heads SET new_messages = new_messages + 1 WHERE BINARY receiverID = '".$USER->userID."' AND senderID = '".$_POST['uid']."' AND (minimized = 1 OR outside = 1)");

		// Update @last_sent for self tab
		$sql = mysqli_query($CHAT, "UPDATE active_chat_heads SET last_sent = 0 WHERE BINARY senderID = '".$USER->userID."' AND BINARY receiverID = '".$_POST['uid']."' ");
		$sql = mysqli_query($CHAT, "UPDATE active_chat_heads SET last_sent = 1 WHERE BINARY receiverID = '".$USER->userID."' AND BINARY senderID = '".$_POST['uid']."' ");

		// Notify other user that typing has been cancled
		$sql = mysqli_query($CHAT, "DELETE FROM typing WHERE BINARY senderID = '".$USER->userID."'");
		break;

	// Fetch more messages for chat
	case "fetch-more-messages":
		_check_params("POST", ["uid", "offset"]);
		$b = array((object) array("uid" => $_POST['uid']));
		$OFFSET = $_POST['offset'];
		$RETRO  = true;
		include "../sql/fetch_messages.php";
		$payload = $b[0];
		break;

	//	Status form chathead, changes
	case "update_chathead_status":
		_check_params("POST", ["type", "uid"]);
		switch(base64_decode($_POST['type']))
		{
		case "minimization":
			$payload = NULL;
			_check_params("POST", ["minimized"]);
			$sql = mysqli_query($CHAT, "UPDATE active_chat_heads SET minimized = ".($_POST['minimized'] == "true" ? 1 : 0).", new_messages = 0 WHERE BINARY senderID = '".$USER->userID."' AND BINARY receiverID = '".$_POST['uid']."'");
		}

		break;

	case "destroyChatHead":
		_check_params("POST", ["uid"]);
		$sql = mysqli_query($CHAT, "DELETE FROM active_chat_heads WHERE BINARY senderID = '".$USER->userID."' AND BINARY receiverID = '".$_POST['uid']."'");
		break;

	case "buildNewChatHead":
		_check_params("POST", ["uid", "backuser"]);

		// Find out if user is @last_sent
		$sql = mysqli_query($CHAT, "SELECT * FROM messages WHERE " . generate_where_for_messages($USER->userID, $_POST['uid']) . " ORDER BY date DESC LIMIT 1");
		$t = mysqli_fetch_object($sql);
		$last_sent = ($t ? ($t->senderID === $USER->userID ? 0 : 1) : -1);	

		// Insert new active_chat_head
		if (!filter_var($_POST['backuser'], FILTER_VALIDATE_BOOLEAN))
		{
			$sql = mysqli_query($CHAT, "INSERT INTO active_chat_heads(senderID, receiverID, last_sent, minimized, outside) VALUES ('".$USER->userID."', '".$_POST['uid']."', '".$last_sent."', 0, 0)");
		} else
		{
			$sql = mysqli_query($CHAT, "UPDATE active_chat_heads SET outside = 0, new_messages = 0, minimized = 0 WHERE BINARY senderID = '".$USER->userID."' AND BINARY receiverID = '".$_POST['uid']."'");
		};

		// Fetch particular user
		// @ACITVE_CHAT_HEADS
		$special_user_id = $_POST['uid'];
		include "../sql/active_chat_heads.php";

		// Delete all old append_messages
		$sql = mysqli_query($CHAT, "DELETE FROM append_messages WHERE BINARY receiverID = '".$USER->userID."'");

		// Fetch messages for active chat heads
		if ($active_users > 0)
		{
			$b = &$payload["active_chat_heads"];
			include "../sql/fetch_messages.php";				
		};
		break;

	case "setOutsideTrue":
		_check_params("POST", ["uid"]);
		$sql = mysqli_query($CHAT, "UPDATE active_chat_heads SET outside = 1 WHERE BINARY senderID = '".$USER->userID."' AND BINARY receiverID = '".$_POST['uid']."'");		
		break;

	case "search-users-sidebar":
		_check_params("POST", ["phrase"]);

		$sql = mysqli_query($CHAT, "SELECT userID AS uid FROM users WHERE (search_value LIKE '%".$_POST['phrase']."%' OR name LIKE '%".$_POST['phrase']."%' OR surname LIKE '%".$_POST['phrase']."%') AND BINARY userID != '".$USER->userID."' ");
		if (mysqli_num_rows($sql))
		{
			$arr = array(); $i = 0;
			while($t = mysqli_fetch_object($sql)) $arr[$i++] = $t;
		} else $arr = NULL;		
		$payload["search"] = $arr;
		break;

	case "change-settings":
		_check_params("POST", ["setting", "value"]);
		$setting = base64_decode($_POST['setting']);
		$value   = filter_var($_POST['value'], FILTER_VALIDATE_BOOLEAN);
		switch($setting)
		{
		case "sound":
			$sql = mysqli_query($CHAT, "UPDATE users SET sound_effect = '".$value."' WHERE BINARY userID = '".$USER->userID."'");
			$payload = NULL;
			break;
		}
		break;

	case "change-online-status":
		_check_params("POST", ["online"]);
		$sql = mysqli_query($CHAT, "UPDATE users SET force_offline = '".$_POST['online']."' WHERE BINARY userID = '".$USER->userID."'");
		$payload = NULL;
		break;

	default: exit_ajax(!true, "ERROR_CHAT: Error in paramater list.");
	}



	echo json_encode($RESPONSE);
	mysqli_close($CHAT);
?>