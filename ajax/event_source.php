<?php 

	session_start();
	define("AJAX", true);
	include "../init.php";
	include "../".CHAT_FILE_CONNECT_DB_CHAT;
	include "../".CHAT_FILE_FUNCTIONS;

	if (!isset($_SESSION['username'])) header("location: ../");
	if (!isset($_GET['action'])) exit("<h1>Parameters not set.</h1>");

	header("Content-Type: text/event-stream\n\n");
	include "../".CHAT_FILE_GET_USER_DATA;

	switch(base64_decode($_GET['action']))
	{
	case "getTypingOppositeUser":
		$f = _check_params("GET", ["uid"]);
		if (!$f) exit("<h1>Parameters not set.</h1>");

		while (1) {
		  echo 'data: {"username": "kalU", "time": "'.date("H:m").'", "text": "Hi everyone."}';
		  echo "\n\n";

		  ob_end_flush();
		  flush();
		  sleep(5);
		}
		break;
	}




?>