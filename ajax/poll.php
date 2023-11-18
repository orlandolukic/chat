<?php
    session_start(); 
    ob_start();
    define("AJAX", true);
    include "../init.php";
    include "../".CHAT_FILE_CONNECT_DB_CHAT;
    include "../".CHAT_FILE_FUNCTIONS;
    include "../".CHAT_FILE_GET_USER_DATA;
    _check_system();

    // Initiate poll.php
    $ACTION   = base64_decode($_POST['action']);
    $info     = array("response" => true, "exit" => false, "exitMssg" => NULL);
    $payload  = array();
    $RESPONSE = array("info" => &$info, "payload" => &$payload);

    switch($ACTION)
    {
    case "chat_refresh":
        // Start all local variables for listening
        $condition = true;  
        $poll_number = CHAT_POLL_MAX_NUMBER;
        // Update user timestamp
        $sql = mysqli_query($CHAT, "UPDATE users SET timestamp = '".time()."', online = '1' WHERE BINARY userID = '".$USER->userID."'");
        while($condition)
        {  
            // Check typing
            $sql1 = mysqli_query($CHAT, "SELECT `typing`.senderID FROM typing  INNER JOIN active_chat_heads ON `typing`.receiverID = `active_chat_heads`.senderID AND `typing`.`senderID` = active_chat_heads.receiverID WHERE `typing`.receiverID = '".$USER->userID."'");

            // Fetch new messages
            $sql2 = mysqli_query($CHAT, "SELECT apID AS messageID, message, date, timestamp, DAY(date) AS day_mssg, senderID FROM append_messages WHERE BINARY receiverID = '".$USER->userID."'");

            // Check typing for current user
            if (mysqli_num_rows($sql1))
            {      
                $w_typing = true;
                $arr = array(); $i = 0;
                while($t = mysqli_fetch_object($sql1))
                {
                    $arr[$i++] = $t->senderID;
                    // Delete typings from table for current user
                    mysqli_query($CHAT, "DELETE FROM typing WHERE BINARY receiverID = '".$USER->userID."' AND BINARY senderID = '".$t->senderID."'");
                };
                $payload["typing"] = $arr;
                mysqli_free_result($sql1);  

            } else
            {
                $w_typing = false;
                $payload["typing"] = array();
            } 

            // Check new messages for current user
            if (mysqli_num_rows($sql2))
            {
                $w_messages = true;
                $messages = array(); $i = 0;
                while( $t = mysqli_fetch_object($sql2) )
                {
                    $t->time = date("H:i", $t->timestamp);
                    $t->message = html_entity_decode($t->message, ENT_QUOTES);
                    $messages[$i++] = $t;
                    mysqli_query($CHAT, "DELETE FROM append_messages WHERE BINARY apID = '".$t->messageID."'");
                };
                $payload["fetch"] = array("i" => (bool) mysqli_num_rows($sql2), "messages" => !mysqli_num_rows($sql2) ? NULL : $messages);
            } else 
            { 
                $w_messages = false;
                $payload["fetch"] = array("i" => false, "messages" => NULL);
            };
            
            $w_stop_poll = !$poll_number;

            // Determine if we are stayin' and waitin' on this page
            $wait = !($w_typing || $w_messages || $w_stop_poll);

            if ($wait)
            {   
                session_write_close(); 
                clearstatcache();                          
                $poll_number--;  
                sleep(CHAT_POLL_SLEEP);                                    
            } else 
            { 
                // Exit polling, finishing state
                $condition = false;   

                // Fetch users and check their statuses
                $sql3 = mysqli_query($CHAT, "SELECT online, force_offline, timestamp, userID AS uid FROM users WHERE username IN (SELECT DISTINCT `members`.username FROM (SELECT DISTINCT groupID FROM members WHERE BINARY username = '".$USER->username."') tbl1 INNER JOIN members ON `members`.groupID = `tbl1`.groupID) AND BINARY userID != '".$USER->userID."'");  
                $users = array(); $k = 0; $online = 0;
                while ($t = mysqli_fetch_object($sql3))
                {
                    $onl = is_online($t->online, $t->force_offline, $t->timestamp);
                    if ($onl) $online++;
                    $users[$k++] = array("uid" => $t->uid, "online" => (bool) $onl);
                }; 
                $payload["status"] = $users;   
                $payload["active_users"] = $online;                                   
            };
           
        };
    break;
    };

    echo json_encode($RESPONSE);
    flush();
    exit();


?>