<?php
    include "init.php";
	session_start();
	session_destroy();
	header("location: " .  SRC);

?>