const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
  const handlerEvents = require(process.env.NODE_ENV === 'development' ? "./handlerEvents.dev.js" : "./handlerEvents.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

  return async function(event) {
    try {
      const message = createFuncMessage(api, event);
      await handlerCheckDB(usersData, threadsData, event);
      const handlerChat = await handlerEvents(event, message);

      if (!handlerChat) return;

      const {
        onStart,
        onChat,
        onReply,
        onEvent,
        handlerEvent,
        onReaction,
        typ,
        presence,
        read_receipt
      } = handlerChat;

      switch (event.type) {
        case "message":
        case "message_reply":
        case "message_unsend":
          onChat();
          onStart();
          onReply();
          break;

        case "event":
          handlerEvent();
          onEvent();
          break;

        case "message_reaction":
          onReaction();
          try {
            if (event.reaction === "😠") {
              if (event.userID ===) {
                api.removeUserFromGroup(event.messageID.reaction, event.threadID, (err) => {
                  if (err) console.error(err);
                });
              } else {
                message.send("( \_/)\n( •_•)\n// >🧠\nYou Drop This Dumb Ass");
              }
            } else if (event.reaction === "😆") {
              if (event.senderID === api.getCurrentUserID() && event.userID === global.GoatBot.config.adminbot[0]) {
                message.unsend(event.messageID.reaction);
              } else {
                api.sendMessage('Invalid owner', event.threadID);
              }
            }
          } catch (e) {
            message.send('An error occurred');
            console.error('Error at handlerAction Code:', e);
          }
          break;

        case "typ":
          typ();
          break;

        case "presence":
          presence();
          break;

        case "read_receipt":
          read_receipt();
          break;

        default:
          console.log(`Unknown event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling event:', error);
    }
  };
};
