<?php 
	
	// @active_chat_heads
	$cond = isset($special_user_id);
	if ($cond)
	{
		$pos  = mysqli_num_rows(mysqli_query($CHAT, "SELECT receiverID AS uid FROM active_chat_heads WHERE BINARY senderID = '".$USER->userID."'"));
	};
	$sql = mysqli_query($CHAT, "SELECT receiverID AS uid, last_sent, outside, minimized, new_messages FROM active_chat_heads WHERE BINARY senderID = '".$USER->userID."' ".($cond ? "AND BINARY receiverID = '".$special_user_id."'" : "")." ORDER BY outside ASC");
	$arr = array(); $i = 0; $active_users = mysqli_num_rows($sql);
	while( $t = mysqli_fetch_object($sql) ) 
	{ 
		$arr[$i]                 = $t;
		$arr[$i]->index          = $i; 
		$arr[$i]->timeouts       = array(
		                                 "typing"         => array("timer" => NULL, "indicator" => false),
		                                 "current_typing" => array("timer" => NULL, "indicator" => false),
		                                 "sound"          => NULL);
		$arr[$i]->sound          = array("has_sound" => true);	// Prep for timer		
		$arr[$i]->last_sent      = -1;
		$arr[$i]->self_typing    = false;	
		$arr[$i]->fetch          = array("new" => 0);
		$arr[$i]->fetching       = array("action" => false, "offset" => CHAT_MSSG_PER_FETCH, "last_fetched_date" => null, "more" => false, "last_user" => null);
		$arr[$i]->position       = ($cond ? $pos : ($i+1));
		$arr[$i]->minimized      = (bool) $t->minimized;
		$arr[$i]->new_messages   = intval($t->new_messages);
		$arr[$i]->outside        = (bool) $t->outside; 
		$i++; 
	};
	mysqli_free_result($sql);
	$payload["active_chat_heads"] = $arr;
?>