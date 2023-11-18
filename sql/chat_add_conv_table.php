<?php 

	$sql = mysqli_query($CHAT, "CREATE TABLE `".$_POST['uid']."_".$USER->userID."` (
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
?>