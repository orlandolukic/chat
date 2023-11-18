<?php 

	function exit_ajax($exit, $mssg)
	{
		echo json_encode(array("info" => array("response" => false, "exit" => $exit, "exitMssg" => $mssg)));
		exit();
	};

	function _check_system()
	{
		global $CHAT_ALLOW_INIT, $CHAT_ERROR_INIT;
		if (!$CHAT_ALLOW_INIT)
		{
			exit_ajax(true, $CHAT_ERROR_INIT);
		}
		if (!isset($_POST['action'])) exit_ajax(false, "Parameters not set.");
		if (!isset($_SESSION['username'])) exit_ajax(false, "Username is not set.");
	}

	function _check_params($m, $arr)
	{
		$go = true;
		for ($i=0; $i<count($arr); $i++)
		{
			$go = $go && ($m === "GET" ? isset($_GET[$arr[$i]]) : isset($_POST[$arr[$i]]) );
		}
		return $go;
	}

	function rand_string($len = 10)
	{
	    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	    $randstring = '';
	    for ($i = 0; $i < $len; $i++) {
	        $randstring = $characters[rand(0, strlen($characters))];
	    }
	    return $randstring;
	}

	function get_profile_picture($u)
	{
		if ($u->profilepic) { return IMAGE_FOLDER_PREPATH."/users/".$u->profilepic; } else { return IMAGE_FOLDER_PREPATH."/img/default-profile-pic.png"; }
	}

	function existing_table($uid1, $uid2, $prepath)
	{
		global $CHAT;
		$sql = mysqli_query($CHAT, "SELECT * FROM information_schema.tables WHERE table_schema = '".CHAT_DB_NAME."' AND table_name = '".$uid1."_".$uid2."'");
		if (mysqli_num_rows($sql))
		{
			return $uid1."_".$uid2;
		} else
		{
			$sql = mysqli_query($CHAT, "SELECT * FROM information_schema.tables WHERE table_schema = '".CHAT_DB_NAME."' AND table_name = '".$uid2."_".$uid1."'");
			if (mysqli_num_rows($sql))
			{
				return $uid2."_".$uid1;
			} else
			{
				create_table($uid1, $uid2);
				return $uid1."_".$uid2;
			}
		}
	}

    function generate_where_for_messages($uid1, $uid2) {
        return "((senderID = '" . $uid1 . "' AND receiverID = '" . $uid2 . "') OR (senderID = '" . $uid2 . "' AND receiverID = '" . $uid1 . "'))";
    }

	  function create_table($param1, $param2)
      {
      	  global $CHAT;
          $sql = mysqli_query($CHAT, "CREATE TABLE `".$param1."_".$param2."` (
          `messageID` int(11) NOT NULL AUTO_INCREMENT,
          `message` text NOT NULL,
          `date` date NOT NULL,
          `timestamp` int(11) NOT NULL,
          `seen` tinyint(1) NOT NULL DEFAULT '0',
          `senderID` int(11) NOT NULL,
          `receiverID` int(11) NOT NULL,
          `message_type` int(11) NOT NULL DEFAULT '0',
          PRIMARY KEY (`messageID`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8;");
     }

     function _array_add($arr, $elem)
     {
     	if (!in_array($elem, $arr)) array_push($arr, $elem);
     }

     function is_online($online, $force_offline, $timestamp)
     {
     	$t = time();
     	switch(true)
		{
		case ( intval($online) && ($t - intval($timestamp)  < 3 * CHAT_AJAX_INTERVAL ) && intval($force_offline)==0 ): $o = 1; break;
		case ( (intval($force_offline)===1 || ($t - intval($timestamp)  >= 3 * CHAT_AJAX_INTERVAL ))): $o = 0; break;
		default: $o = 0;
		};
		return $o;	
     }

     function find_object(&$resource, &$dest, $key, $value)
     {
     	//global $_SESSION['online'];
     	for ($i=0; $i<count($resource); $i++)
     	{
     		if ($resource[$i]->$key == $value) 
     		{
     			$dest = $resource[$i];
     			return;
     		} 
     	}
     }
 


?>