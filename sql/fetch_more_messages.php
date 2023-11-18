<?php 
		$sql = mysqli_query($CHAT, "SELECT receiverID AS uid, last_sent, outside, minimized FROM active_chat_heads WHERE BINARY senderID = '".$USER->userID."'");
		$arr = array(); $i = 0; $active_users = mysqli_num_rows($sql);
		while( $t = mysqli_fetch_object($sql) ) 
		{ 
			$arr[$i]                 = $t; 
			$arr[$i]->timeouts       = array("typing" => array("timer" => NULL, "indicator" => false));
			$arr[$i]->last_sent      = -1;
			$arr[$i]->self_typing    = false;	
			$arr[$i]->fetch          = array("new" => 0);
			$arr[$i]->fetching       = array("action" => false, "offset" => CHAT_MSSG_PER_FETCH, "last_fetched_date" => null, "more" => false, "last_user" => null);

			$arr[$i]->minimized = (bool) $t->minimized;
			if ($t->outside == "0") $arr[$i]->outside = false; else $arr[$i]->outside = true;
			$i++; 
		}
		mysqli_free_result($sql);
		$payload["active_chat_heads"] = $arr;
?>