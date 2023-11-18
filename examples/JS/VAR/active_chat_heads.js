/*
Prototype of chat object "active_chat_heads"
DETAILS
==============================================
*/
{
active_chat_heads: [					
				     {
				     	uid: "856325244", 
				     	last_sent: 0, 	// 0 - SelfSent, 1 - Other UserSent
				     	self_typing: false,
				     	print_new_date: true,
				     	last_date: null,

				     	// - ABOUT OLD MESSAGES
				     	fetching: { action: false, offset: 20, last_fetched_date: "yyyy-mm-dd" },

				     	// - ABOUT NEW MESSAGES
				     	fetch: {new: 0}, // {}

				     	minimized: false,
				     	outside: false,				     	
				     	timeouts: { 
				     		typing: { timer: null, indicator: false }
				     	},
				     	total_messages : 80
				     },
				     // ... 					     
	               ]
}