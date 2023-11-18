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
	<title>Chat on Great Site</title>
    <link rel="icon" type="image/x-icon" href="<?= SRC ?>/img/favicon.png">
	<link rel="stylesheet" type="text/css" href="<?= SRC ?>css/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" href="<?= SRC ?>css/bootstrap.css">
	<link rel="stylesheet" type="text/css" href="<?= SRC ?>css/style.css">
	<link rel="stylesheet" type="text/css" href="<?= SRC ?>css/typing-indicator.css">

	<script type="text/javascript" src="<?= SRC ?>js/jquery.js"></script>
	<script type="text/javascript" src="<?= SRC ?>js/bootstrap.js"></script>
	<script type="text/javascript" src="<?= SRC ?>js/prototypes.js"></script>	
	<?php if ($CHAT_ALLOW_INIT) { ?>
    <script type="text/javascript">
        let AJAX_URL = "<?= AJAX_URL ?>";
    </script>
	<script type="text/javascript" src="<?= SRC ?>js/main.js"></script>
	<?php }; ?>
</head>
<body style="height: 1000px;">
	<?php if ($CHAT_ALLOW_INIT) { ?>
    <div class="container" style="margin-top: 10px;">
        <div class="row">
            <div class="col-md-12 text-center">
                <div style="font-size: 65px">👋</div>
                <h2>Welcome, <strong><?= $USER->name . " " . $USER->surname ?></strong>!</h2>
                <div>Here you can chat with your colleagues!</div>
            </div>
        </div>
    </div>

    <a href="<?= SRC ?>logout">
        <div class="logout-button">
            <i class="fa fa-sign-out"></i> Logout
        </div>
    </a>

	<div class="ec-chat-open-teaser"><i class="fa fa-comments"></i> CHAT</div>
	<div class="ec-chat-placeholder">
		<div class="ec-chat-profile-section">
			<div class="row">
				<div class="col-md-6">
					<div class="ec-chat-user-status btn btn-chat-hover change-network-status not-available" 
					data-toggle="tooltip" data-placement="bottom" title="Go offline">
						<div class="ec-chat-user-available available" data-status="online">
							<span><div class="ec-chat-user-available-sign available"></div> Online</span>
						</div>
						<div class="ec-chat-user-available not-available" data-status="offline">
							<span><span class="not-available"><i class="fa fa-times"></i> </span> Offline</span>
						</div>					
					</div>
				</div>				
				<div class=" col-md-6 text-right">
					<div class="ec-chat-user-status" data-toggle="tooltip" data-placement="bottom" title="Active users">
						<span class="ec-chat-users-available">
						   <span class="ec-chat-users-available-loader"><i class="fa fa-circle-o-notch fa-spin"></i></span>
						   <span class="ec-chat-users-available-number"></span>
						   <i class="fa fa-users"></i>
						</span>
					</div>				
					<div class="ec-chat-user-status btn btn-chat-hover close-ec-chat-placeholder" data-toggle="tooltip" data-placement="bottom" title="Close">
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

		<div class="ec-chat-empty-search-result">
			<div><i class="fa fa-cubes fa-5x"></i></div>
			<div class="text">No results for <div class="ec-chat-search-result-phrase strong"></div></div>
		</div>

		<div class="ec-chat-search-placeholder">			
			<div class="ec-chat-search-items">
				<span><i class="fa fa-search"></i></span>
				<input class="ec-chat-search" type="text" placeholder="Search for users...">
				<div class="ec-chat-settings">
					<i class="fa fa-cog" data-toggle="tooltip" data-placement="bottom" title="Settings"></i>
					<div class="dropup-menu">
						<div class="menu-option" data="sound">
							<span class="option"><i class="fa fa-check"></i></span>
							<span class="text">New message sound</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="ec-chat-loading">
			<div class="content"><i class="fa fa-circle-o-notch fa-spin"></i></div>
		</div>
	</div>

	<div class="ec-chat-heads"></div>

	<div class="ec-chat-more-users">
		<div class="toggle-more-users">
			<i class="fa fa-comments-o fa-2x"></i>
			<div class="ec-chat-mu-number"></div>			
		</div>		
		<div class="ec-chat-mu-list">
			<div class="heading">Active chats</div>
			<div class="list"></div>
		</div>
	</div>

	<?php } else { ?>
            <div class="overlay"></div>
	<div class="container" style="margin-top: 20px;">
		<div class="row">
			<div class="col-md-12 text-center">
				<h3><i class="fa fa-exclamation-triangle"></i> Chat currently unavailable</h3>
				<div><?= $CHAT_ERROR_INIT ?></div>
                <?php if ($SHOULD_REDIRECT_TO_LOGOUT) { ?>
                <div style="margin-top: 10px;">Redirecting to index.php in <span class="timeout-number">5</span> seconds.</div>
                <?php } ?>
			</div>
		</div>
	</div>
	<?php }; ?>

    <?php if ($SHOULD_REDIRECT_TO_LOGOUT) { ?>
        <script type="text/javascript">
            $(window).on("load", function() {
                let leftSeconds = 4;
                setInterval(() => {
                    if (leftSeconds == -1) {
                        window.location.href = "<?= SRC ?>logout";
                        return;
                    }
                    $(".timeout-number").html(leftSeconds);
                    leftSeconds--;
                }, 1000);
            });
        </script>
    <?php }; ?>
</body>
</html>
<?php mysqli_close($CHAT); ?>