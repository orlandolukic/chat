<?php 
	
	// Fetch messages for chat heads

	$sql = mysqli_query($CHAT, "SELECT * FROM information_schema.tables WHERE table_schema = '".CHAT_DB_NAME."' AND table_name = '".$USER->userID."_".$b[$i]->uid."'");
	if (mysqli_num_rows($sql))
	{
		$b[$i]->print_new_date = (bool) !mysqli_num_rows(mysqli_query($CHAT, "SELECT * FROM ".$USER->userID."_".$b[$i]->uid." WHERE date = CURDATE()  LIMIT 1"));
		$rows_all = intval(mysqli_fetch_object(mysqli_query($CHAT, "SELECT COUNT(*) AS count FROM ".$USER->userID."_".$b[$i]->uid.""))->count);
		$sql = mysqli_query($CHAT, "SELECT message, date, DAY(date) AS day_mssg, receiverID, message_type, timestamp, senderID FROM ".$USER->userID."_".$b[$i]->uid." ORDER BY timestamp ASC LIMIT ".CHAT_MSSG_PER_FETCH." OFFSET ".($rows_all-CHAT_MSSG_PER_FETCH<0 ? 0 : $rows_all-CHAT_MSSG_PER_FETCH));
		$g = 0; $messages = array(); $rows = mysqli_num_rows($sql);
		while($h = mysqli_fetch_object($sql))
		{
			// Check date of first fetched message
			if ($g==0)
			{
				$b[$i]->fetching["last_fetched_date"] = $h->date;
				$b[$i]->fetching["more"] = $rows_all-CHAT_MSSG_PER_FETCH > 0;
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
	} else
	{			
		$sql = mysqli_query($CHAT, "SELECT * FROM information_schema.tables WHERE table_schema = '".CHAT_DB_NAME."' AND table_name = '".$b[$i]->uid."_".$USER->userID."'");
		if (mysqli_num_rows($sql))
		{
			$b[$i]->print_new_date = (bool) !mysqli_num_rows(mysqli_query($CHAT, "SELECT * FROM ".$b[$i]->uid."_".$USER->userID." WHERE date = CURDATE() LIMIT 1"));
			$rows_all = intval(mysqli_fetch_object(mysqli_query($CHAT, "SELECT COUNT(*) AS count FROM ".$b[$i]->uid."_".$USER->userID))->count);
			$sql = mysqli_query($CHAT, "SELECT message, date, DAY(date) AS day_mssg, receiverID, message_type, timestamp, senderID  FROM ".$b[$i]->uid."_".$USER->userID." ORDER BY timestamp ASC LIMIT ".CHAT_MSSG_PER_FETCH." OFFSET ".($rows_all-CHAT_MSSG_PER_FETCH<0 ? 0 : ($rows_all-CHAT_MSSG_PER_FETCH)));

			$g = 0; $messages = array(); $rows = mysqli_num_rows($sql);
			while($h = mysqli_fetch_object($sql))
			{
				// Check date of first fetched message
				if ($g==0)
				{
					$b[$i]->fetching["last_fetched_date"] = $h->date;
					$b[$i]->fetching["more"] = $rows_all-CHAT_MSSG_PER_FETCH > 0;
					$b[$i]->total_messages = $rows_all;
				}
				// Check if last message is from opposite user
				if ($g==$rows-1) 
				{					
					if ($h->receiverID != $USER->userID) $b[$i]->last_sent = 0; else $b[$i]->last_sent = 1;		
					$b[$i]->fetching["last_user"] = $h->senderID;
				}
				$h->message = html_entity_decode($h->message);
				$messages[$g] = $h;
				$messages[$g]->time = date("H:i", $h->timestamp);
				$g++;
			}
			mysqli_free_result($sql);
			$b[$i]->messages = $messages;
		} else // No messages
		{
			$b[$i]->messages = NULL;
		}
	};	

?>