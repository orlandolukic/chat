<?php 
	session_start();
	if (isset($_GET['username'])) 
	{ 
		$_SESSION['username'] = $_GET['username'];
	}
	include "init.php";
	include "connectDBChat.php";
	include "functions.php";
	include "get_data.php";
	include CHAT_FILE_SESSIONS;
?>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="cache-control" content="no-cache" />
	<meta charset="utf-8">
	<title>Chat</title>
	<link rel="stylesheet" type="text/css" href="css/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" href="css/bootstrap.css">
	<link rel="stylesheet" type="text/css" href="css/style.css">
	<link rel="stylesheet" type="text/css" href="css/typing-indicator.css">

	<script type="text/javascript" src="<?= SRC ?>js/jquery.js"></script>
	<script type="text/javascript" src="<?= SRC ?>js/bootstrap.js"></script>
	<script type="text/javascript" src="<?= SRC ?>js/prototypes.js"></script>	
	<?php if ($CHAT_ALLOW_INIT) { ?>
	<?php }; ?>
</head>
<body style="height: 1000px;">
	<?php if ($CHAT_ALLOW_INIT) { ?>
	<div class="ec-chat-open-teaser"><i class="fa fa-comments"></i> CHAT</div>
	<div class="ec-chat-placeholder">
		<div class="ec-chat-profile-section">
			<div class="row">
				<div class="col-md-6">
					<div class="ec-chat-user-status btn btn-chat-hover change-network-status" data-toggle="tooltip" data-placement="bottom" title="Budi nedostupan">
						<div class="ec-chat-user-available"><span><div class="ec-chat-user-available-sign"></div> Na mreži</span></div>
					</div>
				</div>				
				<div class=" col-md-6 text-right">
					<div class="ec-chat-user-status" data-toggle="tooltip" data-placement="bottom" title="Aktivni korisnici">
						<span class="ec-chat-users-available">
						   <span class="ex-chat-users-available-loader"><i class="fa fa-circle-o-notch fa-spin"></i></span>
						   <span class="ex-chat-users-available-number"></span>
						   <i class="fa fa-users"></i>
						</span>
					</div>				
					<div class="ec-chat-user-status btn btn-chat-hover close-ec-chat-placeholder" data-toggle="tooltip" data-placement="bottom" title="Zatvaranje">
						<i class="fa fa-arrow-right"></i>
					</div>		
				</div>				
			</div>	
			<img class="ec-chat-mainhead-profile-picture" src="<?= get_profile_picture($USER); ?>">	
			<a href="javascript: void(0);" class="test-link" style="display: none;"></a>	
		</div>
		<div class="ec-chat-status-bar"></div>

		<!-- Append Chat Users -->
		<div class="ec-chat-main-container"></div>
		<!-- /Append Chat Users -->

		<div class="ec-chat-search-placeholder">			
			<div class="ec-chat-search-items">
				<span><i class="fa fa-search"></i></span>
				<input class="ec-chat-search" type="text" placeholder="Pretražite korisnike">
				<span class="ex-chat-settings"><i class="fa fa-cog" data-toggle="tooltip" data-placement="top" title="Podešavanja"></i></span>
			</div>
		</div>

		<div class="ec-chat-loading">
			<div class="content"><i class="fa fa-circle-o-notch fa-spin"></i></div>
		</div>
	</div>

	<div class="ec-chat-heads">
		<div class="ec-chat-head" data-uid="856325244" style="right: 0">
			<div class="ec-chat-head-title">
				<div class="ec-chat-head-available-sign online"></div> 
				<span class="ec-chat-head-name">Dragan Orlandić</span>
				<div class="ec-chat-head-terminate" data-toggle="tooltip" data-placement="left" title="Zatvorite razgovor"><i class="fa fa-times"></i></div>
			</div>
			<div class="ec-chat-head-body">				

				<div class="messages">
					<div class="conversation-message-box opposite-user">
						<div class="opposite-user-image"><img src="<?= SRC ?>users/dari.jpg"></div>
						<div class="user-message">
							<div class="text">
							   <div class="message-set-time"><i class="fa fa-clock-o"></i> PET, 14:16</div>
							   <div class="message">Ne, ne</div>							  
							   <div class="message">Sta radis ovako?</div>
							</div>												
						</div>						
					</div>
				</div>
				<div class="opposite-user-typing-indicator">
					<div class="opposite-user-image"><img src="<?= SRC ?>users/dari.jpg"></div>
					<div class="typing-indicator" data-toggle="tooltip" data-placement="right" title="Dragan kuca">
					  <span></span>
					  <span></span>
					  <span></span>
					</div>
				</div>
			</div>
			<div class="ec-chat-head-typearea">
				<div class="contenteditable-input" contenteditable="true" placeholder="Napisite poruku"></div>
			</div>
			<div class="ec-chat-head-addons">
				<div class="ec-chat-head-addon-item">
					<div class="ec-chat-head-addon-visible">
						<span data-toggle="tooltip" data-placement="right" title="Odaberite emotikon"><i class="fa fa-smile-o"></i></span>
					</div>
					<div class="addon-content">
						<div class="addon-content-main" data-emoticons="ordinary">
							<div>
								<div class="addon-content-icon" data-toggle="tooltip" data-placement="top" title="Srećan"><img src="/img/emoticons/happy.png"></div>
							</div>
							<div>
								<div class="addon-content-icon" data-toggle="tooltip" data-placement="top" title="Suze"><img src="/img/emoticons/sad-tears.png"></div>								
							</div>
						</div>						
						<div class="addon-content-bottom">
							<div class="addon-content-bottom-item active">
								<img src="/img/emoticons/happy.png">
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>	
	</div>

	<script type="text/javascript">
		$("[data-toggle='tooltip']").tooltip();
	</script>

	<div class="ec-chat-more-users">
		<div class="toggle-more-users">
			<i class="fa fa-comments-o fa-2x"></i>
			<div class="ec-chat-mu-number"></div>			
		</div>		
		<div class="ec-chat-mu-list">
			<div class="heading">Aktivni Razgovori</div>
			<div class="list"></div>
		</div>
	</div>

	<?php } else { ?>
	<div class="container" style="margin-top: 20px;">
		<div class="row">
			<div class="col-md-12 text-center">
				<h3><i class="fa fa-exclamation-triangle"></i> Nije moguće aktivirati čet uslugu</h3>
				<div><?= $CHAT_ERROR_INIT ?></div>
			</div>
		</div>
	</div>
	<?php }; ?>
</body>
</html>
<?php mysqli_close($connection); ?>