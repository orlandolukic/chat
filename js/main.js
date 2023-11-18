
$(window).resize(function() {
	var placeholder = $(".ec-chat-placeholder").height();
	$(".ec-chat-main-container").height(placeholder - $(".ec-chat-status-bar").height() - $(".ec-chat-search-placeholder").height() - 41);
})

$(document).ready(function(e) {
	$("[data-toggle='tooltip']").tooltip();
});

$(window).on("load", function(e) {	
	$(this).resize();
	_start();
	_init_chat();
});

/*
document.onselectstart = function() {
	return false;
}
*/

function _start()
{
	"use strict";

	/* All functions for chat operations */ 
	var functions = {
		init : function() 
		{ 
			if (bits.start) return;					
			var m = this;	
			control_vars.main_object = this;
			control_vars.document.title = document.title;
			_chat_ajax({action: btoa("init")}, function(t) {
				$(m).find(".ec-chat-loading").hide(); 
				bits.start = 1;
				settings.chat_interval = t.payload.interval;

				// Hide loader from active users
				$(m).find(".ec-chat-users-available .ec-chat-users-available-loader").hide();
				$(m).find(".ec-chat-users-available .ec-chat-users-available-number").html(t.payload.active_users)

				// Make list of all available users
				if (t.payload.users.length > 0)
				{
					// @active_chat_heads
					// Assign value to control variable, for users
					control_vars.users          = t.payload.users;
					control_vars.myID           = t.payload.myID;
					control_vars.mySex          = t.payload.sex;
					control_vars.fetch_mssg_lim = t.payload.fetch_mssg_lim;
					control_vars.sound          = t.payload.sound;
					control_vars.force_offline  = t.payload.force_offline;

					// Load users on sidebar
					functions.load_users.call(m, t.payload.users);

					// Activate chatbox opening
					functions.activate_opening_chatbox.call(m, t.payload.users);

					// Initiate settings
					subfunctions.sidebar.initiate_settings.call(m, ["sound"]);
				};	

				/* Sidebar settings and initiatings */
				// =====================================================================
				// Initiate event for handling closing chat head list
				subfunctions.sidebar.init_opening_operations.call(m);
				// Adapt text for user sex
				subfunctions.sidebar.text_editing.call(m);
				subfunctions.sidebar.activate_searching_users.call(m);
				subfunctions.sidebar.set_online_status.call(m);
				subfunctions.events.click.start_settings.call(m);
				subfunctions.events.click.change_online_status.call(m);

				// Initiate active chat heads
				functions.build_active_chat_heads.call(m, t.payload.active_chat_heads);				

				// Calculate max chat head per window
				math_functions.chat_head.calculate_max_chat_heads.call(m);

				// Initiate chat refresh actions
				functions.initiate_refresh.call(m);	

				// Activate sidepanel
				subfunctions.sidepanel.initiate.call( $(".ec-chat-more-users") );
			});
		},


		// Load all available users for chat - Sidebar
		load_users : function(u) {
			for (var i=0; i < u.length; i++)
			{
				this.find(".ec-chat-main-container").append('<div class="ec-chat-user-placeholder" data-uid="'+u[i].uid+'">'+
																'<div class="ec-chat-user-image">'+
																	'<img src="'+u[i].picture+'">'+
																'</div>'+
																'<div class="ec-chat-user-name">'+u[i].name+' '+u[i].surname+'</div>'+
																'<div class="ec-chat-user-indicator '+(u[i].online==1 ? "online" : "")+'"></div>'+
															'</div>');
				subfunctions.sidebar.activate_user_chat_placeholder.call(this, u[i]);
			}
		},

		// FUNCTIONS: Initiate chat refresh
		// fn:initiate_refresh
		initiate_refresh : function(it) {
			var m = this;
			_long_poll({action: btoa("chat_refresh")}, function (t) {					
				subfunctions.chat_heads.update_online_status.call(m, t);
				subfunctions.chat_head.update_typing.call($(".ec-chat-heads"), t.payload.typing);
				subfunctions.chat_head.update_fetched_messages.call( $(".ec-chat-heads"), t.payload.fetch );
			}, settings, bits, control_vars, this);			
		},

		// FUNCTIONS: Activation and building chat heads on page loading
		build_active_chat_heads : function(v=null) {
			for (var i=0, b = v; i < b.length; i++)
			{
			//	Start activating chat head
				subfunctions.chat_head.build_chat_head.call(this, b[i]);
			};
		},

		// FUNCTIONS: Focus contenteditable DIV, html element
		focus_cont_edit : function(el)
		{
			// Disable blinking notification for document.title
			window.clearTimeout(control_vars.document.timer);
			document.title = control_vars.document.title;

			 el.focus();
		     if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
		        var range = document.createRange();
		        range.selectNodeContents(el);
		        range.collapse(false);
		        var sel = window.getSelection();
		        sel.removeAllRanges();
		        sel.addRange(range);
		    } else if (typeof document.body.createTextRange != "undefined") {
		        var textRange = document.body.createTextRange();
		        textRange.moveToElementText(el);
		        textRange.collapse(false);
		        textRange.select();
			};
		},

		// Opening chatbox dialog for user
		activate_opening_chatbox : function(it) {
			//this.find(".ec-chat-user-placeholder[data-uid='"+it.uid+"']")
		}
	};

	// List of Mathematical short functions
	var math_functions = {
		chat_head : {
			// Make perfect position for chat_head
			// fn: make_position
			make_position : function(f_pos) {
				var o = control_vars;
				//alert(o.chat_active_chat_heads - o.chat_inactive_chat_heads - 1);
				return (o.chat_head_width + o.chat_head_spacing)*(f_pos ? control_vars.max_chat_heads-1 : o.chat_active_chat_heads - o.chat_inactive_chat_heads - 1) + "px";
			},

			// Calculate max chat heads available for window
			// fn:caluclate_max_chat_heads
			calculate_max_chat_heads: function(r = false) {
				var container = $(document).width() - 270;
				if (!r) control_vars.max_chat_heads = Math.floor(container / (control_vars.chat_head_width + control_vars.chat_head_spacing));
				else { return  Math.floor(container / (control_vars.chat_head_width + control_vars.chat_head_spacing)); }
			},

			calculate_unseen_messages : function() {
				subfunctions.chat_head.set_seen_messages.call(window);
			}
		},

		// G:MATH_FUNCTIONS:G:SIDEPANEL
		sidepanel : {
			calculate_sidepanel_messages : function() {
				var sum = 0;
				for (var i=0, a = control_vars.active_chat_heads; i<a.length; i++)
				{
					if (a[i].outside) sum += a[i].new_messages;
				}
				return sum;
			}
		}
	};

	// List of help functions
	// G:SUBFUNCTION
	var subfunctions = {

		// Group of CHAT_HEAD subfunctions
		// G:SUBFUNCTIONS:G:CHAT_HEAD
		chat_head : {
			// Prep DOM for chat head manipulation
			print_HTML : function(it, force_position = false) 
			{
				var user = getObjectFromArr.call(control_vars.users, "uid", it.uid).object;
				this.append('<div class="ec-chat-head user-content" data-uid="'+user.uid+'" style="right: '+math_functions.chat_head.make_position(force_position)+'">'+
								'<div class="ec-chat-head-title">'+
									'<div class="ec-chat-head-available-sign'+(user.online ? " online" : "")+'"></div>'+
									'<span class="ec-chat-head-name">'+user.name+' '+user.surname+'</span>'+
									'<div class="ec-chat-head-new-messages"></div>'+
									'<div class="ec-chat-head-terminate" data-toggle="tooltip" data-placement="left" title="Close chat"><i class="fa fa-times"></i></div>'+
								'</div>'+
								'<div class="ec-chat-head-loading-messages">'+
									'<div><i class="fa fa-spinner fa-spin fa-5x"></i></div>'+
									'<div class="text">Učitavanje poruka</div>'+
								'</div>'+
								'<div class="ec-chat-head-body">'+																		
									'<div class="messages"></div>'+																			
									'<div class="opposite-user-typing-indicator">'+
										'<div class="opposite-user-image"><img src="'+user.picture+'"></div>'+
										'<div class="typing-indicator" data-toggle="tooltip" data-placement="right" title="'+user.name+' kuca">'+
										  '<span></span><span></span><span></span>'+										
										'</div>'+
									'</div>'+
								'</div>'+
								'<div class="ec-chat-head-typearea">'+
									'<div class="contenteditable-input" contenteditable="true" placeholder="Type your message..."></div>'+
								'</div>'+
								'<div class="ec-chat-head-addons">'+								
									'<div class="ec-chat-head-addon-item" data-addon="emoticons">'+
										'<div class="ec-chat-head-addon-visible">'+
											'<span data-toggle="tooltip" data-placement="right" title="Emoticons"><i class="fa fa-smile-o"></i></span>'+
										'</div>'+
										'<div class="addon-content">'+
											subfunctions.print.emoticons.output()+
										'</div>'+										
									'</div>'+
								'</div>'+
							'</div>');
			},

			// Open chat dialog, append eventListeners to elements
			// Initiate position of chat head
			// fn:build_chat_head
			build_chat_head : function(it, goAJAX = false, return_user = false, deactivate_last = true, put_in_inactive = true) {

				var foo = this, inc = false, appended = false, app = false;

				// Check if window is ready to accept new chat_head
				if (control_vars.chat_active_chat_heads >= control_vars.max_chat_heads && goAJAX)
				{					
					// Window is not ready to add another chat head, activate sidepanel
					// Move LAST chat head into sidepanel	
					appended = true;

					// Working with moving chat_head
					if (deactivate_last)
					{
						// Get last user			
						var moving_chat_head = getObjectFromArr.call(control_vars.active_chat_heads, "position", control_vars.max_chat_heads).object;

						// Deactivate last chat_head in row
						subfunctions.chat_head.deactivate_chat_head.call( $(".ec-chat-head[data-uid='"+moving_chat_head.uid+"']"), moving_chat_head);

						// Set outside property
						_chat_ajax({action: btoa("setOutsideTrue"), uid: moving_chat_head.uid});	
						moving_chat_head.outside = true;
						moving_chat_head.position++;							

						// Update sidepanel, append user to sidepanel
						subfunctions.sidepanel.append_chat_head.call( $(".ec-chat-more-users"), moving_chat_head, true );								
					};									

					if (return_user)
					{
						// Reset outside indicator for current user
						it.outside  = false;
						it.position = control_vars.max_chat_heads;
					};

					// Update status in active_users
					if (!return_user)
					{
						control_vars.chat_active_chat_heads++;							
					};	

					if (put_in_inactive) 
					{
						// Increment sidepanel users
						console.log("INC - fn: build_chat_head, goAjax = true");
						control_vars.chat_inactive_chat_heads++;									
					} else
					{
						//alert(control_vars.chat_inactive_chat_heads)
						/*
						// Increment sidepanel users
						console.log("DEC - fn: build_chat_head, goAjax = true");
						control_vars.chat_inactive_chat_heads--;	*/
					}
										
				} else if (control_vars.chat_active_chat_heads >= math_functions.chat_head.calculate_max_chat_heads(true) && !goAJAX)
				{					
					// Append this element to control_vars->active_chat_heads
					subfunctions.chat_head.init_control_vars.call(this, it);

					// Increment total amount of active chat heads
					control_vars.chat_active_chat_heads++;

					console.log("INC - fn: build_chat_head, goAjax = false");
					// Increment number of outside chat heads
					control_vars.chat_inactive_chat_heads++;

					// Increment sidepanel messages
					control_vars.chat_sidepanel_messages += it.new_messages;

					// (Create sidepanel) and append another user
					subfunctions.sidepanel.append_chat_head.call( $(".ec-chat-more-users"), it, false);
					console.log(control_vars);
					return true;
				} else
				{
					// Increment total amount of active chat heads
					control_vars.chat_active_chat_heads++;	
				};

				// Print HTML data to the DOM
				subfunctions.chat_head.print_HTML.call( $(".ec-chat-heads"), it, false );				

				// Get chatbox dialog
				var chat_head = $(".ec-chat-heads").find(".ec-chat-head[data-uid='"+it.uid+"']");

				// Check if chat_head is minimized and append new-message sign
				if (it.minimized) chat_head.addClass("minimized");
				if (it.new_messages)
				{
					it.fetch.new += it.new_messages;
					chat_head.find(".ec-chat-head-title .ec-chat-head-new-messages").html(it.new_messages);
					chat_head.addClass("new-message");
				};										

				// Determine if user is opening chat or it is user from previous session
				if (goAJAX)
				{	
					_chat_ajax({action: btoa("buildNewChatHead"), uid: it.uid, backuser: return_user}, function(v) {

						if (!v.payload.active_chat_heads.length) throw "Error during request.";						

						// Initialize all CONTROL variables	
						if (!return_user)					
						{
							var elem = v.payload.active_chat_heads[0];
							subfunctions.chat_head.init_control_vars.call(foo, elem);
							if (control_vars.chat_active_chat_heads>=control_vars.max_chat_heads)
							{
								elem.position = control_vars.max_chat_heads;
								elem.outside  = false;
							};																		
						} else
						{
							// Grab real object, not the one that is fetched
							var elem = it;

							// Assign fetched messages to USER_ELEM
							elem.messages = v.payload.active_chat_heads[0].messages;
						};								

						// Print messages for conversation
						subfunctions.chat_head.print_messages.call( chat_head,  elem );

						// Scale elements inside chat head
						subfunctions.chat_head.scale_elems.call(foo, elem);

						// Make tooltips for selected element
						subfunctions.chat_head.create_tooltip.call( $(".ec-chat-heads"),  elem);

						// Make active chat destruction
						subfunctions.chat_head.activate_destruction.call( $(".ec-chat-heads"),  elem );

						// Activate typing for chat head
						subfunctions.chat_head.activate_typing.call( $(".ec-chat-heads"),  elem);

						//	Activate minimization
						subfunctions.chat_head.activate_min.call( $(".ec-chat-heads"),  elem );

						// Activate sending messages
						subfunctions.chat_head.activate_sending_messages.call( $(".ec-chat-heads"),  elem );

						// Scroll bottom
						subfunctions.chat_head.scroll_bottom.call(chat_head);		

						// Enable fetching old messages		
						subfunctions.chat_head.enable_fetching_old_messages.call(chat_head, elem );

						// Enable focusing event for contenteditable
						subfunctions.chat_head.onFocus_contenteditable.call(chat_head, elem);

						// Activate addons
						subfunctions.addons.activate_addons.call(chat_head, elem);
					});
				} else // OPEN CHAT_HEAD WITHOUT SPECIAL AJAX
				{
					// Initialize all CONTROL variables
					subfunctions.chat_head.init_control_vars.call(this, it);									

					// Print messages for conversation
					subfunctions.chat_head.print_messages.call( chat_head, it );

					// Scale elements inside chat head
					subfunctions.chat_head.scale_elems.call(this, it);

					// Make tooltips for selected element
					subfunctions.chat_head.create_tooltip.call( $(".ec-chat-heads"), it);

					// Make active chat destruction
					subfunctions.chat_head.activate_destruction.call( $(".ec-chat-heads"), it );

					// Activate typing for chat head
					subfunctions.chat_head.activate_typing.call( $(".ec-chat-heads"), it);

					//	Activate minimization
					subfunctions.chat_head.activate_min.call( $(".ec-chat-heads"), it );

					// Activate sending messages
					subfunctions.chat_head.activate_sending_messages.call( $(".ec-chat-heads"), it );

					// Scroll bottom
					subfunctions.chat_head.scroll_bottom.call(chat_head);		

					// Enable fetching old messages		
					subfunctions.chat_head.enable_fetching_old_messages.call(chat_head, it);

					// Enable focusing event for contenteditable
					subfunctions.chat_head.onFocus_contenteditable.call(chat_head, it);

					// Activate addons
					subfunctions.addons.activate_addons.call(chat_head, it);
				};
				console.log(control_vars);				
			},

			// Activate minimization option
			activate_min : function(it) {
				var chat_head = this.find(".ec-chat-head[data-uid='"+it.uid+"']");
				chat_head.find(".ec-chat-head-title").on("click", function(g) {					
					subfunctions.chat_head.minimize_chat_head.call(chat_head, it);
				});
			},

			// Scale elements on chat initialization, optimization
			scale_elems : function(it) {				
				var container = $(".ec-chat-heads").find(".ec-chat-head[data-uid='"+it.uid+"']");				
				if (!container.length) return;
				var s_title    = container.find(".ec-chat-head-title").outerHeight(),
				    s_textarea = container.find(".ec-chat-head-typearea").outerHeight(),
				    s_addons   = container.find(".ec-chat-head-addons").outerHeight();
				container.find(".ec-chat-head-body").height( container.height() - s_title - s_textarea - s_addons );				
			},

			// Initialization of all necessary variables for work
			init_control_vars : function(it) {				
				addElem.call(control_vars.active_chat_heads, it);		
				console.log(control_vars);
			},

			// Create tooltip for chat head
			create_tooltip : function(it) {						
				var el = this.find(".ec-chat-head[data-uid='"+it.uid+"']");				
				el.find("[data-toggle='tooltip']").tooltip();
			},

			// Activate destruction for chat head
			activate_destruction : function(it) {
				var parent = this.find(".ec-chat-head[data-uid='"+it.uid+"']");				
				this.find(".ec-chat-head[data-uid='"+it.uid+"'] .ec-chat-head-terminate").on("click", function(e) {
					e.preventDefault();
					subfunctions.destruction.destroy_chat_head.call( parent, it );
					_chat_ajax({action: btoa("destroyChatHead"), uid: it.uid});
					//alert(control_vars.chat_active_chat_heads + " "+ control_vars.chat_inactive_chat_heads);
					subfunctions.chat_head.check_sidebar.call( $(".ec-chat-more-users") );
					// alert(control_vars.chat_active_chat_heads + " "+ control_vars.chat_inactive_chat_heads);
					return false;
				});
			},

			// SUBFUNCTIONS:CHAT_HEAD: Minimize chat head
			// fn:minimize_chat_head
			minimize_chat_head : function(it) {
				var v, b = this;
				if (it.minimized) { window.setTimeout(function() {
					functions.focus_cont_edit(b.find(".contenteditable-input")[0]);
				}, 400) }	

				// Remove "NEW MESSAGE" notification
				this.removeClass("new-message");
				it.fetch.new = 0;
				it.new_messages = 0;

				// Reset page title
				window.clearTimeout(control_vars.document.timer);
				control_vars.chat_unseen_messages = 0;
				document.title = control_vars.document.title;

				this.toggleClass("minimized");					
				v = this.hasClass("minimized");
				it.minimized = this.hasClass("minimized");
				_chat_ajax({action: btoa("update_chathead_status"), type: btoa("minimization"), uid: it.uid, minimized: v});
				console.log(control_vars.active_chat_heads);
			},

			// Activating typing event
			activate_typing : function(it) {
				this.find(".ec-chat-head[data-uid='"+it.uid+"'] .contenteditable-input").on("keyup", function(ev) {
					if ($(this).text().trim().length === 0) return false;
					var obj;
					if (!(obj = getObjectFromArr.call(control_vars.active_chat_heads, "uid", it.uid).object).timeouts.current_typing.indicator)
					{
						// Activate chat typing for current user, display to OPPOSITE user
						_chat_ajax({action: btoa("setTypingForChatHead"), uid: it.uid}, function(h) {});						
						obj.timeouts.current_typing.indicator = true;
						window.clearTimeout(obj.timeouts.current_typing.timer);
						obj.timeouts.current_typing.timer = window.setTimeout(function() {
							obj.timeouts.current_typing.indicator = false;
						}, control_vars.timeout_intervals.chat_typing.sending*1000);
					};
				});
			},

			// Typing update
			update_typing : function(it) {
				if (!it.length)
				{
					// Hide typing indicator for all active users
					this.find(".opposite-user-typing-indicator").hide();
				} else {		
					for (var i=0, b = control_vars.active_chat_heads; i < b.length; i++)
					{
						if (it.hasElem(b[i].uid))
						{
							if (!b[i].outside)
							{
								var user = b[i];
								var el = this.find(".ec-chat-head[data-uid='" + b[i].uid + "']");									
								el.find(".opposite-user-typing-indicator").show();
								if (!b[i].timeouts.typing.indicator) subfunctions.chat_head.scroll_bottom.call(el);
								b[i].timeouts.typing.indicator = true;

								// Regulate chat typing for current user
								b[i].self_typing = false;
								window.clearTimeout(b[i].timeouts.typing.timer);
								b[i].timeouts.typing.timer = window.setTimeout(function() {
									el.find(".opposite-user-typing-indicator").hide();
									user.timeouts.typing.indicator = false;
									window.clearTimeout(user.timeouts.typing.timer);
								}, control_vars.timeout_intervals.chat_typing.receiving*1000);
							};							
						} else
						{
							b[i].timeouts.typing.indicator = false;
							this.find(".ec-chat-head[data-uid='" + b[i].uid + "'] .opposite-user-typing-indicator").hide();
						}						
					}
				};
			},

			// Scrolling to bottom
			scroll_bottom : function() {
				this.find(".ec-chat-head-body").scrollTop(this.find(".ec-chat-head-body")[0].scrollHeight);
			},

			// Scrolling to bottom
			scroll_from_top_fetching : function() {
				this.find(".ec-chat-head-body").scrollTop(20);
			},

			// Send messages, event
			// Activate sending text messages
			activate_sending_messages : function(it) {
				var el = this.find(".ec-chat-head[data-uid='"+it.uid+"']");
				el.find(".contenteditable-input").on("keydown", function(ev) {					
					if ($(this).text().trim().length == 0) { $(this).html(""); functions.focus_cont_edit(this);  }
					var event = ev || window.event;
					if ( (ev.keyCode === 13 || ev.charCode === 13) && !event.shiftKey && $(this).text().trim().length > 0)
					{
						var v = this;
						_chat_ajax({action: btoa("sendMessage"), message: $(this).html(), uid: it.uid, mssg_type: 0});
						window.setTimeout(function() {
							$(v).empty();
						}, 5);						
						subfunctions.chat.append_message.call( $(".ec-chat-heads"), it, $(this).html() );						
						functions.focus_cont_edit(this);
						subfunctions.chat_head.scroll_bottom.call(el);					
					}
				});
			},

			// Print messages for user's conversation
			print_messages : function(it) {	
				var t;			
				// Delete all messages withing place for messages	
				this.find(".ec-chat-head-body .messages").html('');				
				// Hide loading messages sign
				this.find(".ec-chat-head-loading-messages").hide();
				for (var i=0, b = it.messages, current_sender = -1, day = -1; b && i < b.length; i++, t = false)
				{
					// Printing date when message is in different date
					var date = new Date(b[i].date);
					if (day !== parseInt(b[i].day_mssg))
					{
						t = true;
						day = parseInt(b[i].day_mssg);						
						this.find(".ec-chat-head-body .messages").append("<div class=\"message-set-time\" data-messages-date=\""+b[i].date+"\"><i class=\"fa fa-calendar-o\"></i> "+control_vars.days[date.getDay()]+", "+date.print(true)+"</div>")
					};
					if (b[i].senderID != current_sender)
					{	
						current_sender = b[i].senderID;			
						if (t)
						{										
							this.find(".ec-chat-head-body .messages .message-set-time[data-messages-date='"+b[i].date+"']")
							.after("<div class=\"conversation-message-box "+(control_vars.myID == b[i].senderID ? "self" : "opposite")+"-user\">"+
							        	( control_vars.myID != b[i].senderID ? 
								       "<div class=\"opposite-user-image\"><img src=\""+getObjectFromArr.call(control_vars.users, "uid", b[i].senderID).object.picture+"\"></div>" : "")+
								        "<div class=\"user-message\">"+									        							        	
								        	"<div class=\"text\">"+		
								        		(control_vars.myID == b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+						        		
								        		subfunctions.messages.print_message_to_chatDialog.call(this, b[i])+
								        		(control_vars.myID != b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+
								        	"</div>"+
								        "</div>"+
								     "</div>");
						} else
						{
							this.find(".ec-chat-head-body .messages")
							.append("<div class=\"conversation-message-box "+(control_vars.myID == b[i].senderID ? "self" : "opposite")+"-user\">"+
							        	( control_vars.myID != b[i].senderID ? 
								        	"<div class=\"opposite-user-image\"><img src=\""+getObjectFromArr.call(control_vars.users, "uid", b[i].senderID).object.picture+"\"></div>" : "")+
								        "<div class=\"user-message\">"+									        	        	
								        	"<div class=\"text\">"+		
								        		(control_vars.myID == b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+						        		
								        		subfunctions.messages.print_message_to_chatDialog.call(this, b[i])+
								        		(control_vars.myID != b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+
								        	"</div>"+
								        "</div>"+
								     "</div>");
						}					
					} else
					{
						if (t)
						{
							this.find(".ec-chat-head-body .messages .message-set-time[data-messages-date='"+b[i].date+"']")
							.after("<div class=\"conversation-message-box "+(control_vars.myID == b[i].senderID ? "self" : "opposite")+"-user\">"+
								( control_vars.myID != b[i].senderID ? 
								   "<div class=\"opposite-user-image\"><img src=\""+getObjectFromArr.call(control_vars.users, "uid", b[i].senderID).object.picture+"\"></div>" : "")+					        	
						        "<div class=\"user-message\">"+							        	       	
						        	"<div class=\"text\">"+		
						        		(control_vars.myID == b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+						        		
						        		subfunctions.messages.print_message_to_chatDialog.call(this, b[i])+
						        		(control_vars.myID != b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+
						        	"</div>"+
						        "</div>"+
						     "</div>");
						} else
						{
							this.find(".ec-chat-head-body .messages .conversation-message-box."+(control_vars.myID == b[i].senderID ? "self" : "opposite")+"-user")
							.last()
							.find(".user-message")
							.before(( control_vars.myID != b[i].senderID ? 
								        	"<div class=\"opposite-user-image\"><img src=\""+getObjectFromArr.call(control_vars.users, "uid", b[i].senderID).object.picture+"\"></div>" : ""))
							.append("<div class=\"text\">"+
							        	(control_vars.myID == b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+						        		
						        		subfunctions.messages.print_message_to_chatDialog.call(this, b[i])+
						        		(control_vars.myID != b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+
							        "</div>");
						}						
					}					
				}
				it.fetching.offset = it.messages.length;
				if (it.messages.length > control_vars.fetch_mssg_lim) it.fetching.more = true;
				delete it.messages;						
			},

			// Fetch old messages when scrolled to top of the chat head
			enable_fetching_old_messages : function(it) {
				var chat_head = this;
				this.find(".ec-chat-head-body").on("scroll", function(e) {										
					// Fetch old messages
					if ($(this).scrollTop()<=0) 
					{
						var record = getObjectFromArr.call(control_vars.active_chat_heads, "uid", it.uid).object;						
						if (record.fetching.action || this.scrollHeight < this.height || !record.fetching.more) return false;

						record.fetching.action = true;
						var obj = $(this);
						$(this).find(".ec-chat-fetching-messages").show();
						_chat_ajax({action: btoa("fetch-more-messages"), offset: record.fetching.offset, uid: it.uid}, function(b) {
							
							// Determine if there are messages to fetch
							record.fetching.action = false;
							// Ask if there are mesages to move offset with
							if (b.payload.messages.length)
							{
								it.fetching.offset += b.payload.fetching.limit;
								it.fetching.more = b.payload.fetching.more;		
							} else
							{
								it.fetching.more = false;
							};											

							// Finish with fetching, print messages
							obj.find(".ec-chat-fetching-messages").hide();
							subfunctions.chat_head.append_fetched_messages.call(chat_head, it, b.payload);	
							subfunctions.chat_head.scroll_from_top_fetching.call(chat_head);
						});					
					};
				});
			},


			// Callback from XMLHttpRequest, print messages to user chat-head
			append_fetched_messages : function(it, payload) {
				for (var i=0, temp = {current_sender: it.fetching.last_user}, b = payload.messages, gone = false; b && i < b.length; i++)
				{
					subfunctions.chat_head.print_each_message.call(this, temp, b, i);											
				};
			},

			// Update fetched messages, USER TYPED NEW MESSAGE
			// fn:update_fetched_messages
			update_fetched_messages : function(obj) {				
				if (!obj.i) return;
				var user, elem, o, parent = this, y, mssgs = 0, curr_user = null;
				for (var i=0, a = obj.messages; i < a.length; i++)
				{
					user = getObjectFromArr.call(control_vars.active_chat_heads, "uid", a[i].senderID);
					// Check if user exsists in @active_chat_users					
					if (user.length)
					{
						// There is no need for creating NEW chat head, find exsiting one
						user = user.object; 
						if (!user.outside)
						{
							// Get @chat_head from DOM
							elem = this.find(".ec-chat-head[data-uid='"+user.uid+"']");

							// Adding message to chat head	
																	
							o = { current_sender: user.last_sent===1 ? user.uid : control_vars.myID };							
							user.fetch.new++;							
							user.last_sent = 1;
							user.total_messages++;
							user.fetching.offset++;							

							// Check if user is "minimized"
							elem.find(".ec-chat-head-new-messages").html(user.fetch.new);
							if (user.minimized) 
							{ 
								elem.addClass("new-message");	
								user.new_messages++;
							}					

							// Print messages to screen
							subfunctions.chat_head.print_each_message.call(elem, o, a, i, false);

							// Disable opposite user typing
							elem.find(".opposite-user-typing-indicator").hide();

							// Scroll bottom chat_head body							
							subfunctions.chat_head.scroll_bottom.call(elem);	
						} else
						{
							// Add new messages on the "outside" pannel
							user.last_sent = 1;
							user.new_messages++;
							user.fetch.new++;														
							user.total_messages++;
							user.fetching.offset++;
							control_vars.chat_sidepanel_messages++;

							$(".ec-chat-more-users .user-content[data-uid='"+user.uid+"']")
							.addClass("new-message").find(".list-item-message-number").html(user.new_messages);	
							subfunctions.sidepanel.check_new_messages.call($(".ec-chat-more-users"));						
						};

						// Play sound
						if (control_vars.sound) control_vars.audio.play();	

					} else // Make new chat head and start conversation
					{
						y = getObjectFromArr.call(control_vars.users, "uid", a[i].senderID);
						subfunctions.chat_head.build_chat_head.call( control_vars.main_object, y.object, true);
						if (control_vars.sound) control_vars.audio.play();
						user = { uid: a[i].senderID };						
					};

					// Statistics
					if (curr_user !== user.uid) { curr_user = user.uid; mssgs++; }

				};
				// Change title of the document, and update unseen messages
				control_vars.chat_unseen_messages += mssgs;
				subfunctions.document.title.change_title.call(document, { uid: curr_user });
			},

			// Function that prints messages to user chat_head
			print_each_message : function(o, b, i, retro = true) {
				// b = { date, senderID, message }
				// Printing date when message is in different date	
				var date = new Date(b[i].date);			
				if (this.find(".ec-chat-head-body .messages .message-set-time[data-messages-date='"+b[i].date+"']").length)
				{
					// There is current date, continue
					if (b[i].senderID != o.current_sender)
					{	
						o.current_sender = b[i].senderID;	
						if (retro)
						{
							this.find(".ec-chat-head-body .messages .message-set-time[data-messages-date='"+b[i].date+"']")
							.after("<div class=\"conversation-message-box "+(control_vars.myID == b[i].senderID ? "self" : "opposite")+"-user\">"+
							        	( control_vars.myID != b[i].senderID ? 
								        	"<div class=\"opposite-user-image\"><img src=\""+getObjectFromArr.call(control_vars.users, "uid", b[i].senderID).object.picture+"\"></div>" : "")+							        		
									        "<div class=\"user-message\">"+							        	
									        	"<div class=\"text\">"+							        		
									        		(control_vars.myID == b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+						        		
									        		subfunctions.messages.print_message_to_chatDialog.call(this, b[i])+
									        		(control_vars.myID != b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+
									        	"</div>"+
									        "</div>"+
								     "</div>");
						} else
						{
							this.find(".ec-chat-head-body .messages .conversation-message-box:last")
							.after("<div class=\"conversation-message-box "+(control_vars.myID == b[i].senderID ? "self" : "opposite")+"-user\">"+
							        	( control_vars.myID != b[i].senderID ? 
								        	"<div class=\"opposite-user-image\"><img src=\""+getObjectFromArr.call(control_vars.users, "uid", b[i].senderID).object.picture+"\"></div>" : "")+
									        "<div class=\"user-message\">"+												        	
									        	"<div class=\"text\">"+	
									        		(control_vars.myID == b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+						        		
									        		subfunctions.messages.print_message_to_chatDialog.call(this, b[i])+
									        		(control_vars.myID != b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+
									        	"</div>"+
									        "</div>"+
								     "</div>");
						}							
					} else
					{
						// User is already sent messages, just prepend	
						if (retro)
						{
							this.find(".ec-chat-head-body .messages .conversation-message-box."+(control_vars.myID == b[i].senderID ? "self" : "opposite")+"-user:first .user-message")							
							.prepend("<div class=\"text\">"+
										(control_vars.myID == b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+						        		
						        		subfunctions.messages.print_message_to_chatDialog.call(this, b[i])+
						        		(control_vars.myID != b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+
						        	"</div>");	
						} else
						{
							this.find(".ec-chat-head-body .messages .conversation-message-box."+(control_vars.myID == b[i].senderID ? "self" : "opposite")+"-user:last .user-message")							
							.append("<div class=\"text\">"+
										(control_vars.myID == b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+						        		
						        		subfunctions.messages.print_message_to_chatDialog.call(this, b[i])+
						        		(control_vars.myID != b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+
						        	"</div>");	
						};														
					}						
				} else // There is no time header, append that
				{
					if (b[i].senderID != o.current_sender)
					{	
						if (retro)
						{
							o.current_sender = b[i].senderID;		
							this.find(".ec-chat-head-body .messages")
							.prepend("<div class=\"message-set-time\" data-messages-date=\""+b[i].date+"\"><i class=\"fa fa-calendar-o\"></i> "+control_vars.days[date.getDay()]+", "+date.print(true)+"</div>")
							.find(".message-set-time:first")
							.after("<div class=\"conversation-message-box "+(control_vars.myID == b[i].senderID ? "self" : "opposite")+"-user\">"+
							        	( control_vars.myID != b[i].senderID ? 
								        	"<div class=\"opposite-user-image\"><img src=\""+getObjectFromArr.call(control_vars.users, "uid", b[i].senderID).object.picture+"\"></div>" : "")+
									        "<div class=\"user-message\">"+									        							        	
									        	"<div class=\"text\">"+		
									        		(control_vars.myID == b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+						        		
									        		subfunctions.messages.print_message_to_chatDialog.call(this, b[i])+
									        		(control_vars.myID != b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+
									        	"</div>"+
									        "</div>"+
								     "</div>");
						} else
						{
							o.current_sender = b[i].senderID;		
							this.find(".ec-chat-head-body .messages")
							.append("<div class=\"message-set-time\" data-messages-date=\""+b[i].date+"\"><i class=\"fa fa-calendar-o\"></i> "+control_vars.days[date.getDay()]+", "+date.print(true)+"</div>")
							.find(".message-set-time:last")
							.after("<div class=\"conversation-message-box "+(control_vars.myID == b[i].senderID ? "self" : "opposite")+"-user\">"+
							        	( control_vars.myID != b[i].senderID ? 
								        	"<div class=\"opposite-user-image\"><img src=\""+getObjectFromArr.call(control_vars.users, "uid", b[i].senderID).object.picture+"\"></div>" : "")+
									        "<div class=\"user-message\">"+									        							        	
									        	"<div class=\"text\">"+		
									        		(control_vars.myID == b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+						        		
									        		subfunctions.messages.print_message_to_chatDialog.call(this, b[i])+
									        		(control_vars.myID != b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+
									        	"</div>"+
									        "</div>"+
								     "</div>");
						}										
					} else
					{
						// User is already sent messages, just prepend
						this.find(".ec-chat-head-body .messages")
						.prepend("<div class=\"message-set-time\" data-messages-date=\""+b[i].date+"\"><i class=\"fa fa-calendar-o\"></i> "+control_vars.days[date.getDay()]+", "+date.print(true)+"</div>")
						.find(".message-set-time:"+(retro ? "first" : "last"))
						.after("<div class=\"conversation-message-box "+(control_vars.myID == b[i].senderID ? "self" : "opposite")+"-user\">"+	
									( control_vars.myID != b[i].senderID ? 
							        "<div class=\"opposite-user-image\"><img src=\""+getObjectFromArr.call(control_vars.users, "uid", b[i].senderID).object.picture+"\"></div>" : "")+				        		
					        		"<div class=\"user-message\">"+						        					        	
								        	"<div class=\"text\">"+	
								        		(control_vars.myID == b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+						        		
								        		subfunctions.messages.print_message_to_chatDialog.call(this, b[i])+
								        		(control_vars.myID != b[i].senderID ? "<span class=\"time\">"+b[i].time+"</span>" : "")+
								        	"</div>"+
								        "</div>"+
					        	"</div>");					
					}
				}							
			},

			// SUBFUNCTIONS:CHAT_HEAD: onFocus_contenteditable
			// fn:onFocus_contenteditable
			onFocus_contenteditable : function() {
				$(this).find(".contenteditable-input").on("click", function() {
					subfunctions.chat_head.set_seen_messages.call(window);
				});							
			},

			// SUBFUNCTIONS:CHAT_HEAD:  deactivate_chat_head
			// fn:deactivate_chat_head
			// Function frees memory and moves chat head in sidepanel
			deactivate_chat_head : function(it) {
				//console.log("INC - fn: deactivate_chat_head");
				//control_vars.chat_inactive_chat_heads++;
				subfunctions.destruction.destroy_chat_head.call(this, it, false);
			},

			// G:SUBFUNCTIONS:G:CHAT_HEAD:fn:set_seen_messages
			// fn:set_seen_messages
			set_seen_messages : function() {
				window.clearInterval(control_vars.document.timer);
				document.title = control_vars.document.title;
				control_vars.chat_unseen_messages = 0;
			},

			// G:SUBFUNCTIONS:G:CHAT_HEAD:fn:check_sidebar
			// fn:check_sidebar
			// ====================================================
			// 		Function checks if there are inactive_chat_heads available in sidepanel and
			// 		prints back new chat_head if there exists
			check_sidebar : function() {
				var elem = null;
				for (var i=0, b = control_vars.active_chat_heads; i<b.length; i++)
				{
					// Get first elem that is in the sidepanel
					if (b[i].outside) { elem = b[i]; break; }
				};
				
				if (elem)
				{
					subfunctions.events.click.open_chat_head.call( window , elem, true, false, false);					
				};		
				subfunctions.sidepanel.check_existance.call( $(".ec-chat-more-users") );
			}
		},
		// /Group of CHAT_HEAD subfunctions
		// G:SUBFUNCTIONS:/G:CHAT_HEAD

		// Addons subfunctions
		// =============================================
		// ! G:SUBFUNCTIONS:G:ADDONS
		addons : {

			// Activate chat_head addons
			// G:SUBFUNCTIONS:G:ADDON:FN:activate_addons
			activate_addons : function(it) {
				var m = this;
				this.find(".ec-chat-head-addons .ec-chat-head-addon-item").each(function(i, v) {
					$(v).on("click", function() {
						m.find(".addon-content").toggleClass("show");
					});					
					subfunctions.addons.activate_addon.call(m, $(v), it);
				});
			},

			// Activate particular addon
			// G:SUBFUNCTIONS:G:ADDONS:FN:activate_addon
			activate_addon : function(parent, it) {
				var m = this;
				switch(parent.attr("data-addon"))
				{
				case "emoticons":
					this.find(".addon-content-icon").on("click", function() {						
						m.find(".contenteditable-input").html(m.find(".contenteditable-input").html() + $(this).attr("data-icon") );
						functions.focus_cont_edit(m.find(".contenteditable-input")[0]);
					});
					break;
				}
			}
		},
		// ! G:SUBFUNCTIONS:/G:ADDONS

		// Group of PRINT subfunctions
		// G:SUBFUNCTIONS:G:PRINT
		print : {

			// Group for printing emoticons to the screen
			// =================================================================================
			// ! G:SUBFUNCTIONS:G:PRINT:G:EMOTICONS
			emoticons : {
				output : function() {
					var str = '', obj = control_vars.emoticons, substr = '', t = 0, lock = false;
					for (var key in obj)
					{
						lock = false;
						str += '<div class="addon-content-main" data-emoticons="'+key+'">';
						for (var i=0, elems = 1, b = obj[key].icons; i<b.length; i++, elems++)
						{
							if (elems < settings.emoticons_per_line+1 && !lock) { str += '<div>'; lock = true; }
							if (elems < settings.emoticons_per_line+1)
							{
								str += '<div class="addon-content-icon" data-toggle="tooltip" data-icon="'+b[i].typography+'" data-placement="top" title="'+b[i].name+'">'+
											'<img src="'+b[i].replace+'">'+
										'</div>';
							};
							if (elems === settings.emoticons_per_line+1)
							{
								i--; elems = 0; lock = false; str += '</div>';
							}
						};
						if (lock) { str += '</div>'; }				
						str += '</div>';
					};						

					for (var key in obj)
					{
						substr += '<div class="addon-content-bottom-item'+(t===0 ? " active" : "")+'">'+
									'<img src="'+obj[key].image+'">'+
								'</div>';
						if (!t) t++;
					}

					str += '<div class="addon-content-bottom">'+
								substr+
							'</div>';

					return str;
				}
			}
			// ! G:SUBFUNCTIONS:G:PRINT:/G:EMOTICONS
		},

		// G:SUBFUNCTIONS:G:DESTRUCTION
		// Group of DESTRUCTION functions
		destruction : {
			// Function for chat head destruction
			// G:SUBFUNCTIONS:G:DESTRUCTION:FN:destroy_chat_head
			destroy_chat_head : function(it, force = true) {

				// Destroy eventListeners for deleting Chat Head
				this.find(".ec-chat-head-terminate").off("click");
				this.find(".ec-chat-head-title").off("click");
				this.find(".ec-chat-head-typearea .contenteditable-input").off("keyup").off("keydown");
				this.find(".ec-chat-head-body").off("scroll");
				this.find(".ec-chat-head-addons .addon-content").off("click");
				this.find(".ec-chat-head-addons .addon-content .addon-content-icon").off("click");

				// Destroy variables
				if (force)
				{				
					control_vars.active_chat_heads = removeArrObjectElem.call(control_vars.active_chat_heads, "uid", it.uid);					
					console.log(control_vars.active_chat_heads);
					control_vars.chat_active_chat_heads--;
					subfunctions.chat_heads.move_opened_chatheads.call($(".ec-chat-heads"), it);
				};				
				this.remove();	// Remove element from chat heads				
			},

			// Function for sidepanel user entry destruction
			// G:SUBFUNCTIONS:G:DESTRUCTION:FN:destroy_sidepanel_user
			destroy_sidepanel_user : function(it, remove_elem = true, swap = false) {
				this.off("click").find(".list-item-close").off("click");
				if (remove_elem) 
				{
					control_vars.chat_active_chat_heads--;
					control_vars.active_chat_heads = removeArrObjectElem.call(control_vars.active_chat_heads, "uid", it.uid);
				};
				console.log("DEC - fn: destroy_sidepanel_user");
				control_vars.chat_inactive_chat_heads--;
				control_vars.chat_sidepanel_messages -= it.new_messages;
				this.remove();

				if (!swap) subfunctions.sidepanel.check_existance.call( $(".ec-chat-more-users") );
			}
		},

		// Group of CHAT HEADS functions, in global
		chat_heads : {
			// After closing one chat head, move other chat heads to right position
			// fn:move_opened_chatheads
			move_opened_chatheads : function() {				
				control_vars.active_chat_heads = subfunctions.chat_heads.sort.call( control_vars.active_chat_heads, "position", "ASC");
				for (var i=0, m = 0, b = control_vars.active_chat_heads; i < b.length; i++)
				{
					if (b[i].outside) continue;
					this.find(".ec-chat-head[data-uid='"+b[i].uid+"']").css({
						right: ( m*(control_vars.chat_head_width + control_vars.chat_head_spacing) ) + "px" 
					});	
					b[i].position = m+1;
					m++;
				};				
			},

			// G:SUBFUNCTIONS:G:CHAT_HEADS:FN:update_online_status
			// Update online status in sidebar
			update_online_status : function(arr) {
				$(this).find(".ec-chat-users-available .ec-chat-users-available-number").html(arr.payload.active_users);
				for (var i=0, loc = arr.payload.status; i<loc.length; i++)
				{
					var user = getObjectFromArr.call(control_vars.users, "uid", loc[i].uid);
					if (user.length) user.object.online = loc[i].online;
					//	Change user's chat status
					if (loc[i].online)
					{
						this.find(".ec-chat-main-container .ec-chat-user-placeholder[data-uid='"+loc[i].uid+"'] .ec-chat-user-indicator").addClass("online");
						if (getObjectFromArr.call(control_vars.active_chat_heads, "uid", loc[i].uid).length)
						{
							$(".ec-chat-heads .ec-chat-head[data-uid='"+loc[i].uid+"'] .ec-chat-head-title .ec-chat-head-available-sign").addClass("online");
							$(".ec-chat-more-users .list-item[data-uid='"+loc[i].uid+"'] .ec-chat-head-available-sign").addClass("online");						
						}					
					} else
					{
						this.find(".ec-chat-main-container .ec-chat-user-placeholder[data-uid='"+loc[i].uid+"'] .ec-chat-user-indicator").removeClass("online");
						if (getObjectFromArr.call(control_vars.active_chat_heads, "uid", loc[i].uid).length)
						{
							$(".ec-chat-heads .ec-chat-head[data-uid='"+loc[i].uid+"'] .ec-chat-head-title .ec-chat-head-available-sign").removeClass("online");
							$(".ec-chat-more-users .list-item[data-uid='"+loc[i].uid+"'] .ec-chat-head-available-sign").removeClass("online");							
						}					
					}			
				};
			},


			// fn:sort
			sort : function(key, stype) {
				var obj = this;
				switch(stype)
				{
				case "ASC":
					for (var i=0, t = obj.length; i<t; i++)
					{
						for (var j=i+1; j<t-1; j++)
						{
							if (obj[i][key] > obj[j][key])
							{
								var f = obj[i];
								obj[i] = obj[j];
								obj[j] = f;
							};
						}
					};
					break;
				case "DESC":
					for (var i=0, t = obj.length; i<t; i++)
					{
						for (var j=i+1; j<t-1; j++)
						{
							if (obj[i][key] < obj[j][key])
							{
								var f = obj[i];
								obj[i] = obj[j];
								obj[j] = f;
							};
						}
					};
					break;
				}
				return obj;
			}
		},

		// Timeout subfunctions
		timeout_functions: {
			clearTypingForChatHead : function(it, o) {
				//o.self_typing = false;				
			}
		},

		// Sidepanel functions
		// G:SUBFUNCTIONS:G:SIDEPANEL
		sidepanel : {

			// Activate basic events on sidepanel element
			// fn:initiate
			initiate: function() {
				var m = this;

				$(window).on("click", function(e) {
					if ( m.has(e.target).length == 0 && !m.is(e.target) )
					{
						m.find(".ec-chat-mu-list").hide();
						subfunctions.sidepanel.check_new_messages.call(m);
					}
				});

				this.find(".toggle-more-users").on("click", function() {
					if (m.find(".ec-chat-mu-list").is(":visible"))
					{
						m.find(".ec-chat-mu-list").hide();
						if (m.find(".ec-chat-mu-number").hasClass("show-new-messages")) m.find(".ec-chat-mu-number").show();
					} else
					{
						m.find(".ec-chat-mu-number").hide();
						m.find(".ec-chat-mu-list").show();
					};
				});

				if (control_vars.active_chat_heads > control_vars.max_chat_heads) this.find(".toggle-more-users").addClass("show-content");
			},



			// G:SUBFUNCTIONS:G:SIDEPANEL:FN:APPEND_CHAT_HEAD
			// fn:append_chat_head
			append_chat_head : function(user, calculate) {
				var user_db = getObjectFromArr.call(control_vars.users, "uid", user.uid).object;
				this.find(".ec-chat-mu-list .list").append(
						'<div class="list-item user-content '+(user.new_messages ? "new-message" : "")+'" data-uid="'+user.uid+'">'+
							'<div class="ec-chat-head-available-sign '+(user_db.online ? "online" : "")+'"></div>'+
							'<span class="list-item-name">'+user_db.name+' '+user_db.surname+'</span>'+
							'<span class="list-item-message-number">'+user.new_messages+'</span>'+
							'<span class="list-item-close">&times;</span>'+
						'</div>');
				this.find(".toggle-more-users").addClass("show-content");

				// Add new messages to sidepanel
				if (user.new_messages>0 && calculate)
				{				
					control_vars.chat_sidepanel_messages += user.new_messages;	
				};

				// Checkup sidepanel messages sign
				subfunctions.sidepanel.check_new_messages.call(this);

				// Add event listeners to element
				subfunctions.sidepanel.activate_events.call(this, user);
			},

			// fn:activate_events
			activate_events : function(u) {
				var m = this;
				this.find(".list-item[data-uid='"+u.uid+"']").on("click", function() {					
					$(".ec-chat-user-placeholder[data-uid='"+u.uid+"']").trigger("click");
					if (!u.minimized) u.new_messages = 0;
					math_functions.sidepanel.calculate_sidepanel_messages.call(window);
					subfunctions.sidepanel.check_new_messages.call(m);
				});
				this.find(".list-item[data-uid='"+u.uid+"'] .list-item-close").on("click", function() {					
					subfunctions.destruction.destroy_sidepanel_user.call( m.find(".list-item[data-uid='"+u.uid+"']"), u );
					_chat_ajax({action: btoa("destroyChatHead"), uid: u.uid});
					return false;
				});
			},

			// fn:remove_events
			remove_events : function() {
				this.off("click");		
				this.find(".list-item-close").off("click");
			},

			// fn:check_new_messages
			check_new_messages: function() {
				if (control_vars.chat_sidepanel_messages <= 0) this.find(".ec-chat-mu-number").removeClass("show-new-messages").hide(); else 
				{
					this.find(".ec-chat-mu-number").html(control_vars.chat_sidepanel_messages).addClass("show-new-messages").show();					
				}
			},

			// fn:swap_user
			swap_user : function(u) {

				var user = getObjectFromArr.call(control_vars.active_chat_heads, "uid", u.uid).object;

				control_vars.chat_sidepanel_messages -= user.new_messages;
				subfunctions.sidepanel.remove_events.call( this.find(".list-item[data-uid='"+u.uid+"']") );

				// Delete user and swap values
				this.find(".list-item[data-uid='"+u.uid+"']").remove();
				console.log("DEC - fn: swap_user");
				control_vars.chat_inactive_chat_heads--;				

				subfunctions.sidepanel.check_existance.call(this);
			},

			// fn:check_existance
			check_existance : function() {
				subfunctions.sidepanel.check_new_messages.call(this);
				if (control_vars.chat_inactive_chat_heads===0)
				{
					subfunctions.sidepanel.hide.call( this );
				} else
				{
					subfunctions.sidepanel.show.call( this );
				}
			},

			// fn:hide
			hide : function() {
				this.hide();
			},

			// fn:show
			show : function() {
				this.show();
			},

			// fn:update_position
			update_position : function(action = 1) {
				for (var i = 0, b = control_vars.active_chat_heads; i < b.length; i++)
				{
					if (b[i].position > control_vars.max_chat_heads)
					{
						if (action===1) b[i].position++; else b[i].position--;
					}
				}
			}
		},

		// Chat functions
		// G:SUBFUNCTIONS:G:CHAT
		chat : {
			// Append message to the chat head - conversation
			append_message : function(it, mssg) {

				var chat_head = this.find(".ec-chat-head[data-uid='"+it.uid+"']"), t = false, date = new Date();
				// Continue to append messages	

				// Printing date when day has passed
				if (it.print_new_date)
				{
					t = true;
					it.print_new_date = false;
					chat_head.find(".ec-chat-head-body .messages").append("<div class=\"message-set-time\" data-messages-date=\""+date.print()+"\"><i class=\"fa fa-calendar-o\"></i> "+control_vars.days[date.getDay()]+", "+date.print(true)+"</div>")
				};		
				if (it.last_sent===0)	// Take a look at changing user ???
				{		
					if (t)	// If program had to append date for modification, add new user placeholder
					{
						chat_head.find(".ec-chat-head-body .messages .message-set-time[data-messages-date='"+date.print()+"']")
						.after("<div class=\"conversation-message-box self-user\">"+					        	
						        "<div class=\"user-message\">"+							        	
						        	"<div class=\"text\">"+	
						        		"<span class=\"time\">"+date.printTime()+"</span>"+						        		
						        		subfunctions.messages.print_message_to_chatDialog.call(this, mssg, false)+					        		
						        	"</div>"+
						        "</div>"+
						     "</div>");
					} else
					{
						chat_head.find(".ec-chat-head-body .messages .conversation-message-box.self-user")
						.last()
						.find(".user-message")
						.append("<div class=\"text\">"+
						        	"<span class=\"time\">"+date.printTime()+"</span>"+							        		
					        		subfunctions.messages.print_message_to_chatDialog.call(this, mssg, false)+		        		
						        "</div>");
					}					
				} else
				{					
					it.last_sent = 0; // Self sent, initiate user change
					if (t) // Check if time has been printed
					{						
						chat_head.find(".ec-chat-head-body .messages .message-set-time[data-messages-date='"+date.print()+"']")
						.after("<div class=\"conversation-message-box self-user\">"+					        	
							        "<div class=\"user-message\">"+								        						        	
							        	"<div class=\"text\">"+		
							        		"<span class=\"time\">"+date.printTime()+"</span>"+							        		
							        		subfunctions.messages.print_message_to_chatDialog.call(this, mssg, false)+						        		
							        	"</div>"+
							        "</div>"+
							     "</div>");
					} else
					{
						chat_head.find(".ec-chat-head-body .messages .conversation-message-box:last")
						.after("<div class=\"conversation-message-box self-user\">"+					        	
							        "<div class=\"user-message\">"+							        	
							        	"<div class=\"text\">"+	
							        		"<span class=\"time\">"+date.printTime()+"</span>"+					        		
							        		subfunctions.messages.print_message_to_chatDialog.call(this, mssg, false)+					        		
							        	"</div>"+
							        "</div>"+
							     "</div>");
					}					
				}
				it.fetching.offset++;
				if (!it.fetching.more && it.fetching.offset > control_vars.fetch_mssg_lim) it.fetching.more = true;					
			}
		},

		// SUBFUNCTIONS : messages
		messages : {

			// Replace emoticons
			replace_emoticons : function(obj, obj_indicator) {
				var emoji = false, object = control_vars.emoticons;
				for(var key in object)
				{
					for (var i=0, emoticons = object[key].icons; i<emoticons.length; i++)
					{
						if (obj_indicator)
						{
							if (obj.message.indexOf(emoticons[i].typography) !== -1 && obj.message.trim().length === emoticons[i].typography.length 
							    || 
							    obj.message.indexOf(emoticons[i].alternate) !== -1 && obj.message.trim().length === emoticons[i].alternate.length) emoji = true;
							obj.message = obj.message.replace(emoticons[i].typography, 
							                                  "<span class=\"emoticon-placeholder\"><img src=\""+emoticons[i].replace+"\"></span>");
							obj.message = obj.message.replace(emoticons[i].alternate,  
							                                  "<span class=\"emoticon-placeholder\"><img src=\""+emoticons[i].replace+"\"></span>");
						} else
						{
							if (obj.indexOf(emoticons[i].typography) !== -1 && obj.trim().length === emoticons[i].typography.length
							    || 
							    obj.indexOf(emoticons[i].alternate) !== -1  && obj.trim().length === emoticons[i].alternate.length ) emoji = true;
							obj = obj.replace(emoticons[i].typography, "<span class=\"emoticon-placeholder\"><img src=\""+emoticons[i].replace+"\"></span>");
							obj = obj.replace(emoticons[i].alternate,  "<span class=\"emoticon-placeholder\"><img src=\""+emoticons[i].replace+"\"></span>");						
						};
					};
				}			
				return { object: obj, emoji: emoji };
			},

			// fn:print_message_to_chatDialog
			print_message_to_chatDialog : function(mssg, object = true) {							
				mssg = subfunctions.messages.replace_emoticons.call(this, mssg, object);
				return "<div class=\"message "+(mssg.emoji ? "only-emoticon" : "")+"\">"+(object ? mssg.object.message : mssg.object)+"</div>";
			}
		},

		// Group of functions for chat heads list, sidebar
		// G:SUBFUNCTIONS:G:SIDEBAR
		sidebar : {
			init_opening_operations : function() {
				var g = this;
				this.find(".close-ec-chat-placeholder").on("click", function(e) {
					if (!bits.closed)
					{
						g.addClass("closed");
						bits.closed = 1;
					} else
					{
						g.removeClass("closed");
						bits.closed = 0;
					}
				});

				$(".ec-chat-open-teaser").on("click", function() {
					g.removeClass("closed");
					bits.closed = 0;
				});
			},

			// G:SUBFUNCTIONS:G:SIDEBAR:FN:activate_searching_users
			activate_searching_users : function() {
				var m = this;
				this.find(".ec-chat-search").on("keyup", function(e) {
					if ((e.keyCode || e.which) === 27 || this.value.trim().length===0)
					{
						subfunctions.sidebar.searching.reset_search.call(m);
					} else
					{
						subfunctions.sidebar.searching.search.call(m, this.value);
					}
				})
			},

			// G:SUBFUNCTIONS:G:SIDEBAR:FN:set_online_status
			set_online_status : function() {
				if (control_vars.force_offline===1)
				{
					this.find(".change-network-status").removeClass("available").addClass("not-available");
				} else
				{
					this.find(".change-network-status").addClass("available").removeClass("not-available");
				}
			},

			// G:SUBFUNCTIONS:G:SIDEBAR:FN:initiate_settings
			initiate_settings : function(arr) {
				var settings_container = this.find(".ec-chat-settings");
				for (var i=0; i<arr.length; i++)
				{
					control_vars[arr[i]] ? settings_container.find(".menu-option[data='"+arr[i]+"']").addClass("checked") : null;
				};
			},

			// G:SUBFUNCTIONS:G:SIDEBAR:G:SEARCHING
			searching : {

				// G:SUBFUNCTIONS:G:SIDEBAR:G:SEARCHING:FN:reset_search
				reset_search : function() {
					this.find(".ec-chat-search").val('');
					this.find(".ec-chat-main-container").show();
					this.find(".ec-chat-user-placeholder").show();
					this.find(".ec-chat-empty-search-result").hide();
				},

				search : function(p) {
					var m = this;
					_chat_ajax({action: btoa("search-users-sidebar"), phrase: p}, function(d) {
						if (d.payload.search)
						{
							m.find(".ec-chat-empty-search-result").hide();
							m.find(".ec-chat-main-container").show();
							m.find(".ec-chat-user-placeholder").hide();
							for (var i=0, resp = d.payload.search; i<resp.length; i++)
							{
								m.find(".ec-chat-user-placeholder[data-uid='"+resp[i].uid+"']").show();
							}	
						} else
						{
							m.find(".ec-chat-main-container").hide();
							m.find(".ec-chat-empty-search-result").show();
							m.find(".ec-chat-empty-search-result .ec-chat-search-result-phrase").html(p);
						};	

					});
				}

			},
			// G:SUBFUNCTIONS:G:SIDEBAR:/G:SEARCHING

			// Function for printing text depending on user sex
			// Section: sidebar chat
			text_editing : function() {
				this.find(".change-network-status").attr("data-original-title", "Go offline");
			},

			// Function for activate click event on user placeholder in sidebar
			activate_user_chat_placeholder : function(user) {
				var o = this;
				this.find(".ec-chat-user-placeholder[data-uid='"+user.uid+"']").on("click", function(e) {
					subfunctions.events.click.open_chat_head.call(o, user);					
					subfunctions.sidebar.searching.reset_search.call(o);
				});
			}
		},
		// Group of SIDEBAR subfunctions

		// /Group of DOCUMENT subfunctions
		document : {

			// Subgroup of title functions
			title : {
				// Change document's title when necessery
				change_title : function(user = null) {
					var getUser, pom = 0;
					if (user) getUser = getObjectFromArr.call(control_vars.users, "uid", user.uid).object;
					window.clearInterval(control_vars.document.timer);

					// Change document title
					document.title = "("+control_vars.chat_unseen_messages+") " + control_vars.document.title;

					control_vars.document.timer = window.setInterval(function() {																							
						if ( !pom )
						{
							subfunctions.document.title.timers.change(getUser);
							pom = 1;
						} else
						{
							subfunctions.document.title.timers.reset();
							pom = 0;
						};
					}, control_vars.timeout_intervals.change_document_title*1000);				
				},

				// timer functions
				timers : {
					// Change timer function
					change : function(g) {
						if ( control_vars.chat_unseen_messages === 1) 
						{ 
							document.title = (g.sex ? "Korisnica" : "Korisnik") + " " +  g.name + " " + g.surname + " je " + (g.sex ? "poslala" : "poruku") + " poruku.";
						} else
						{
							document.title = "Nove poruke: " + control_vars.chat_unseen_messages;
						};		
					},
					// Reset timer function
					reset : function() {
						document.title = "("+control_vars.chat_unseen_messages+") " + control_vars.document.title;
					}
				}

			}
		},
		// /Group of DOCUMENT subfunctions

		// G:SUBFUNCTIONS:G:EVENTS
		events: {

			// G:SUBFUNCTIONS:G:EVENTS:G:CLICK
			click: {

				// // G:SUBFUNCTIONS:G:EVENTS:G:CLICK:FN:open_chat_head
				// fn:open_chat_head
				open_chat_head : function(obj, carry_obj = false, deactivate_last = true, put_in_inactive = true) {
					var userWide, userWideCount;
					userWideCount = !carry_obj ? (userWide = getObjectFromArr.call(control_vars.active_chat_heads, "uid", obj.uid)).length : true;
					// Check wheater user exists in @active_chat_heads
					if (userWideCount)
					{
						userWide = !carry_obj ? userWide.object : obj;
						// Check if user is in outside panel
						if (!userWide.outside) 
						{							
							if (userWide.minimized)
							{
								subfunctions.chat_head.minimize_chat_head.call( $(".ec-chat-head[data-uid='"+userWide.uid+"']"), userWide);
							} else 
							{
								functions.focus_cont_edit( $(".ec-chat-heads .ec-chat-head[data-uid='"+userWide.uid+"'] .contenteditable-input")[0] );
								subfunctions.chat_head.set_seen_messages.call(window);
							};							
						} else
						{
							// Chat head IS OUTSIDE
							// Chat head needs to be built
							// Remove user from sidepanel

							subfunctions.destruction.destroy_sidepanel_user.call( $(".ec-chat-more-users .list-item[data-uid='"+userWide.uid+"']"), userWide, false, true );							
							subfunctions.chat_head.build_chat_head.call( $(".ec-chat-heads"), userWide, true, true, deactivate_last, put_in_inactive);

							subfunctions.sidepanel.check_existance.call( $(".ec-chat-more-users") );

							if (!userWide.minimized)
							{
								functions.focus_cont_edit( $(".ec-chat-heads .ec-chat-head[data-uid='"+userWide.uid+"'] .contenteditable-input")[0] );
							}
						};
					} else // Clicked user is not in the @active_chat_heads array, go and append it
					{									
						//_chat_ajax({action: btoa("fetchUserInfo")});
						subfunctions.chat_head.build_chat_head.call(this, obj, true);
						subfunctions.sidepanel.check_existance.call( $(".ec-chat-more-users") );					
					};
				},

				// G:SUBFUNCTIONS:G:EVENTS:G:CLICK:FN:start_settings
				start_settings : function() {
					var m = this.find(".ec-chat-settings");
					this.find(".ec-chat-settings").on("click", function() {
						$(this).find(".dropup-menu").toggleClass("show");
					});

					$(window).on("click", function(e) {
						if ( m.has(e.target).length == 0 && !m.is(e.target))
						{
							$(".ec-chat-settings .dropup-menu").removeClass("show");
						}								
					}).on("keydown", function(e) {
						if ((e.keyCode || e.which) === 27)
						{
							$(".ec-chat-settings .dropup-menu").removeClass("show");
						}
					});

					this.find(".ec-chat-settings .menu-option").on("click", function() {
						var data = $(this).attr("data");
						if (typeof control_vars[data] != typeof "undefined")
						{
							$(this).toggleClass("checked");
							control_vars[data] = !control_vars[data];
							_chat_ajax({action: btoa("change-settings"), setting: btoa(data), value: control_vars[data]});						
						}
					});
				},

				// G:SUBFUNCTIONS:G:EVENTS:G:CLICK:FN:change_online_status
				change_online_status : function() {
					this.find(".ec-chat-user-available").on("click", function() {
						var parent = $(".change-network-status");
						if (control_vars.force_offline===1)
						{
							parent.removeClass("not-available").addClass("available");
							parent.attr("data-original-title", "Go offline");
							_chat_ajax({action: btoa("change-online-status"), online: 0});
							control_vars.force_offline = 0;
						} else
						{
							parent.removeClass("available").addClass("not-available");
							parent.attr("data-original-title", "Go online");
							_chat_ajax({action: btoa("change-online-status"), online: 1});
							control_vars.force_offline = 1;
						};						
					});
				}	
			}
		}
	};

	// =============================================================
	// GLOBAL VARIABLES
	// =============================================================

	var settings = 
	{
		path: "/",						// Path to chat application
		pathAJAX: "/",					// Path to chat AJAX root request page
		chat_interval: null,
		chat_interval_function: null,
		emoticons_per_line: 4
	};

	var control_vars = 
	{
		// List of all active users - uid's
		// =========================================================
		// - last_sent: Indicator if current user is sent last message to another user (with UID) or not
		// 0 - self sent, continue to add messages
		// 1 - received message, initiate user change message
		// format: {uid: ind ,[...]}
		active_chat_heads: [
							 /* Example
						     {
						     	uid: "856325244", 
						     	last_sent: 0, 
						     	self_typing: false,
						     	print_new_date: true,
						     	last_date: null,
						     	fetching: { action: false, offset: 20, last_fetched_date: "yyyy-mm-dd"},
						     	minimized: false,
						     	outside: false,
						     	fetch_mssg_lim: 20,
						     	timeouts: { 
						     		typing: { timer: null, indicator: false }
						     	}
						     } */					     
			               ],
		users: null,
		myID: null,
		mySex: null,
		days: ["NED", "PON", "UTO", "SRE", "ČET", "PET", "SUB"],
		audio: new Audio("../audio/notif.mp3"),
		main_object: null,

		chat_head_width: 280,
		chat_head_height: 400,
		chat_head_spacing: 20,
		chat_active_chat_heads: 0,
		chat_inactive_chat_heads: 0,
		chat_sidepanel_messages: 0,
		chat_unseen_messages: 0,

		// Emoticons
		emoticons: {
			ordinary: {
				image: settings.path+"img/emoticons/happy-D.png",
				icons: [
					{ typography: ";)",  alternate: ";-)",  replace: settings.path+"img/emoticons/wink.png",   	  name: "Wink"},	 	// ;)
					{ typography: ":(",  alternate: ":-(",  replace: settings.path+"img/emoticons/sad.png",       name: "Sad" },			// :(
					{ typography: ":)",  alternate: ":-)",  replace: settings.path+"img/emoticons/happy.png",     name: "Happy" },			// :)
					{ typography: ":D",  alternate: ":-D",  replace: settings.path+"img/emoticons/happy-D.png",   name: "Laugh" },			// :D
					{ typography: ":P",  alternate: ":-P",  replace: settings.path+"img/emoticons/happy-P.png",   name: "Wow" },	// :P
					{ typography: ":'(", alternate: ":'(",  replace: settings.path+"img/emoticons/sad-tears.png", name: "Sad tears" },			// :'(
					{ typography: ":*",  alternate: ":-*",  replace: settings.path+"img/emoticons/kiss.png",      name: "Sending kisses" },		// :*
					{ typography: "(h)", alternate: "<3",   replace: settings.path+"img/emoticons/heart.png",     name: "Heart"},			// <3
					{ typography: "8)",  alternate: "8-)",  replace: settings.path+"img/emoticons/cool.png",      name: "Cool"},			// 8)
					{ typography: ";*",  alternate: ";-*",  replace: settings.path+"img/emoticons/love-you.png",  name: "In love"},		// ;*
					{ typography: ":|",  alternate: ":-|",  replace: settings.path+"img/emoticons/sceptic.png",   name: "Tired"}		 	// :|
				]	
			}
		},

		// Intervals in seconds
		timeout_intervals: { chat_typing: {sending: 2.8, receiving: 3}, polling: 10, change_document_title: 3 },

		// Pollings
		pollings: { fetch: { ajax: null, interval: null } },

		// Document properties
		document : { title: null, alternate_title: null , timer: { change: null, reset: null } },

		max_chat_heads: 0
	};

	var bits = {
		start: 0,
		closed: 0
	};

	/* Chat operations */
	$.fn.chat = function(o = null) {
		if (typeof o === typeof null) functions.init.call(this); else
		{
			if (o.action) functions[o.action].apply(this, params);
		}
		return this;
	};
}

function _init_chat()
{
	if (typeof called !== "undefined" && called) return;
	$(".ec-chat-placeholder").chat();
}

function _destroy_chat(t, g, b)
{
	console.error(t.info.exitMssg);
	if (t.info.exit) { window.clearInterval(g.chat_interval_function); b.start = 0; }
}

function _chat_ajax(d, f = function() {}, s=null, b=null)
{
	$.ajax({
		url: AJAX_URL + "main",
		method: "POST",
		async: true,
		data: d,
		cache: false,
		crossDomain: false,
		success: function(g) {
			var g = JSON.parse(g); if (!g.info.response) _destroy_chat(g, s, b); else f(g);
		},
		error: function(xhr, status, error) {			
			console.warn("Chat not available.");
			console.log(error);
			//_destroy_chat();			
		}
	})
}

function _long_poll(d, f = function() {}, s, b, c, o)
{
	$.ajax({
		url: AJAX_URL +"poll",
		method: "POST",
		async: true,
		data: d,
		cache: false,
		crossDomain: false,
		timeout: 0,
		success: function(g) {
			var g = JSON.parse(g); if (!g.info.response) _destroy_chat(g, s, b); else f(g);
		},
		complete: function() {
			_long_poll(d, f, s, b, c, o);
		},
		error: function(xhr, status, error) {}
	})
}
