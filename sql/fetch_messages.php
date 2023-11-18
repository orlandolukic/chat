<?php 
	
	// Fetch messages for chat heads
	for ($i=0; $i<count($b); $i++)
	{
        $b[$i]->print_new_date = (bool) !mysqli_num_rows(mysqli_query($CHAT, "SELECT * FROM messages WHERE date = CURDATE() AND " . generate_where_for_messages($USER->userID, $b[$i]->uid) . " LIMIT 1"));
		$rows_all = intval(mysqli_fetch_object(mysqli_query($CHAT, "SELECT COUNT(*) AS count FROM messages WHERE " . generate_where_for_messages($USER->userID, $b[$i]->uid))))->count;
		$sql = mysqli_query($CHAT, "SELECT message, date, DAY(date) AS day_mssg, receiverID, message_type, timestamp, senderID FROM messages WHERE " . generate_where_for_messages($USER->userID, $b[$i]->uid) ." ORDER BY timestamp ".(isset($RETRO) && $RETRO ? "DESC" : "ASC")." LIMIT ".CHAT_MSSG_PER_FETCH." OFFSET ".(isset($OFFSET) ? $OFFSET : ($rows_all-CHAT_MSSG_PER_FETCH<0 ? 0 : $rows_all-CHAT_MSSG_PER_FETCH)));
		$g = 0; $messages = array(); $rows = mysqli_num_rows($sql);
		while($h = mysqli_fetch_object($sql))
		{
			// Check date of first fetched message
			if ($g==0)
			{
				$b[$i]->fetching["last_fetched_date"] = $h->date;
				$b[$i]->fetching["more"] = $rows_all-CHAT_MSSG_PER_FETCH > 0;
				$b[$i]->fetching["limit"] = $rows;
				$b[$i]->total_messages = $rows_all;
			}
			// Check if last message is from opposite user
			if ($g==$rows-1) 
			{					
				if ($h->receiverID != $USER->userID) $b[$i]->last_sent = 0; else $b[$i]->last_sent = 1;	
				$b[$i]->fetching["last_user"] = $h->senderID;					
			};
			$h->message = html_entity_decode($h->message);				
			$messages[$g] = $h;
			$messages[$g]->time = date("H:i", $h->timestamp);
			$g++;
		}
		mysqli_free_result($sql);
		$b[$i]->messages = $messages;
	}		

?>