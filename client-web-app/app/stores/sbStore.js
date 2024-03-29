import Reflux from 'reflux';
import SendBird from 'sendbird';
import request from 'superagent';
import sbactions from '../actions/sbActions';
// import auth from './auth';

const APP_ID = '78A3DDF9-3396-4088-95C3-A5E8CBDF9AD3';
const API_TOKEN = 'ff8bf5060352c01ce575287f25def5be4b02fd6d';
const sb = new SendBird({ appId: APP_ID });

/* The main controler class
for messaging in terms of MVC*/

class sbStore extends Reflux.Store {
  constructor() {
    super();

    // All neccesary states
    this.state = {
      userID: '',
      userNick: '',
      loggedIn: false,
      profileURL: '', // TODO: Implement!
      userList: [],
      currentChannel: {},
      channelInView: '',
      chatOpen: false,
      otherUser: '',
      otherUserNick: '',
      otherUserProfileUrl: '',
      prevMessages: [],
      messages: [],
      channelHandler: {},
      isTyping: false,
      newMsgContent: '',
      snackbarOpen: false,
      lastMessage: null,
    };
    this.listenables = sbactions;

    // if ((this.props || {}).otherUserID && this.props.otherUserNickName) {
    //   this.openChat (this.props.otherUserID, this.props.otherUserNickName);
    // }
    // if (this.props.otherUserID && this.props.otherUserNickName) {
    //   this.openChat (this.props.otherUserID, this.props.otherUserNickName);
    // }
    //  sbactions.loginUser(auth.state.me.email);
  }

  openChat(userid, userNick) {
    // 1) Check if a channel with the other user already exists.
    // 2a) If YES, JOIN and load previous messages.
    // 2b) If NO, create the new channel and event handlers and JOIN.

    // Clear the current messages array of old user messages which were sent in the last session
    this.setState({
      prevMessages: [],
      messages: [],
    });

    // 1) First query using SendBird to get the list of channels user participating in...
    if (this.state.loggedIn) {
      const channelListQuery = sb.GroupChannel.createMyGroupChannelListQuery();
      channelListQuery.includeEmpty = true;
      channelListQuery.limit = 10;

      if (channelListQuery.hasNext) {
        channelListQuery.next((channelList, error) => {
          if (error) {
            console.error(`error querying for channel list: ${error}`);
            return;
          }
          console.log(`Got the channel list for ${this.state.userID}: `);
          console.log(channelList);

          for (let i = 0, size = channelList.length; i < size; i += 1) {
            console.log(`entered for loop ${i}`);
            for (let n = 0; n < channelList[i].members.length; n += 1) {
              if (channelList[i].members[n].userId === userid) {
                // 2a) If YES, JOIN and load previous messages.
                console.log('Channel already exists, getting previous messages.');
                this.setState({
                  chatOpen: true,
                  otherUser: userid,
                  otherUserNick: userNick,
                  currentChannel: channelList[i],
                  channelInView: channelList[i].channelUrl,
                  otherUserProfileUrl: channelList[i].members[n].profileUrl,
                  lastMessage: channelList[i].lastMessage,
                });
                sbactions.loadPreviousMessages(channelList[i]);
                return;
              }
            }
          }
          // 2b) If NO, create the new channel and event handlers and JOIN.
          this.createChannel(this.state.userID, userid);
          this.setState({
            chatOpen: true,
            otherUser: userid,
            otherUserNick: userNick,
            lastMessage: null,
          });
        });
      }
    } else {
      alert('Not logged in! Please log in before trying to chat.');
    }
  }
// Function to make channel and handle it
// Between 1-1 users
  createChannel(userID, otherUserID) {
    console.log(`trying to make a new channel between ${userID} and ${otherUserID}`);
    // TODO: Implement channelhandler for each one here.

    const userIds = [`${userID}`, `${otherUserID}`];
    const name = `Chat between ${userID} and ${otherUserID}`;
    const coverUrl = '';
    const data = '';

    sb.GroupChannel.createChannelWithUserIds(userIds, true, name, coverUrl, data,
      (channel, error) => {
        if (error) {
          console.error(`error creating new channel: ${error}`);
          return;
        }
        console.log(`made the new channel successfully: ${channel}`);
        let url = '';
        for (let i = 0, size = channel.members.length; i < size; i += 1) {
          if (channel.members[i].userId !== userID) {
            url = channel.members[i].profileUrl;
          }
        }
        this.setState({
          currentChannel: channel,
          channelInView: channel.channelUrl,
          otherUserProfileUrl: url,
        });
        console.log(channel);
      });
  }

  loadPreviousMessages(channel) {
    const messageListQuery = channel.createPreviousMessageListQuery();

    messageListQuery.load(20, true, (messageList, error) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(`Got the previous messages: ${messageList}`);
      console.log(messageList);
      this.setState({
        prevMessages: messageList.reverse(),
      });
    });

    // if (prevMessages[prevMessages.length-1]._sender.userId !== this.state.userId) {
    //   var lastMessageTestedIndex = -1;
    //   for (var i = prevMessages.length - 1; i >= 0; i--) {
    //     var unreadCount = currentChannel.getReadReceipt(prevMessages[i]);
    //     if (i === prevMessages.length - 1 && unreadCount === 0) {
    //       return;
    //     }
    //     if (unreadCount > 0) {
    //       lastMessageTestedIndex = i;
    //     }
    //   }
    //   if (lastMessageTestedIndex >= 0) {
    //     this.setState({
    //       unreadMessages : prevMessages.length - lastMessageTestedIndex,
    //     })
    //   }
    //
    //
    // }
  }

  loginUser(userid) {
    sb.connect(userid, (user, error) => {
      if (error) {
        alert(`Could not log in as user ${userid}`);
      } else {
        console.log(`Logged in as user ${userid}`);
        this.setState({
          userID: user.userId,
          userNick: user.nickname,
          profileURL: user.profileUrl,
        });
        console.log(`nickname is: ${this.state.userNick}, username is ${this.state.userID}`);
        console.log(user);
        this.setState({
          loggedIn: true,
        });
        sbactions.loadOnlineUsersList();
        sbactions.makeChannelHandler();
      }
    });
  }

  makeChannelHandler() {
    this.setState({
      channelHandler: new sb.ChannelHandler(),
    });

    const x = this;

    this.state.currentChannel.onMessageReceived = function (channel, message) {
      console.log('CHANNEL HANDLER: Got a message!! Here: ');
      console.log(channel, message);

      try {
        if (message.channelUrl === this.state.channelInView) {
          const messagesState = x.state.messages;
          messagesState.push(message);
          x.setState({
            messages: messagesState,
          });
          console.log('our messages list contains: ');
          console.log(x.state.message);
        } else {
          // console.log('Firing a notification a');
          sbactions.fireNewNotification(message);
        }
      } catch (TypeError) {
        // console.log('Firing a notification b');
        sbactions.fireNewNotification(message);
      }
    };

    this.state.channelHandler.onTypingStatusUpdated = function (channel) {
      const typing = channel.isTyping();
      x.setState({
        isTyping: typing,
      });
    };

    // TODO: Unique handler ID is set to UserID (may be a problem?)
    sb.addChannelHandler(this.state.userID, this.state.channelHandler);
  }


  sendMessage(message) {
    // TODO: add these messages on to the end of the messages list so they appear in UI
    const data = '';
    const customType = '';
    this.state.currentChannel.sendUserMessage(message, data, customType, (mess, error) => {
      if (error) {
        console.error(`error sending message: ${error}`);
        return;
      }
      console.log(`message sent!! ${mess}`);
      console.log(mess);
      const messagesState = this.state.messages;
      messagesState.push(mess);
      this.setState({
        messages: messagesState,
      });
    });
  }

  blockUser() {
    const { otherUser, userID } = this.state;
    const userid = userID;
    const uri = `https://api.sendbird.com/v3/users/${userid}/block`;
    request.post(uri)
         .set('Content-Type', 'application/json', 'charset=utf8')
         .set('Api-Token', API_TOKEN)
         .send({
           target_id: otherUser,
         })
       .end((err, res) => {
         if (err || !res.ok) {
           console.log(`Error Blocking the user: ${otherUser}`);
         } else {
           console.log(`User Blocked Successfully: ${JSON.stringify(res.body)}`);
           console.log(res.body);
         }
       });
  }

  unBlockUser() {
    const { otherUser, userID } = this.state;
    const uri = `https://api.sendbird.com/v3/users/${userID}/block/${otherUser}`;
    request.delete(uri)
         .set('Content-Type', 'application/json', 'charset=utf8 ')
         .set('Api-Token', API_TOKEN)
         .send({})
       .end((err, res) => {
         if (err || !res.ok) {
           console.log(`Error Unblocking the user: ${otherUser}`);
         } else {
           console.log(`User Unblocked Successfully: ${JSON.stringify(res.body)}`);
         }
       });
  }

  createUserCompleted(res) {
    if (res.status === 200) {
      console.log('SendBird User Creation: Server response 200');
      sb.connect(res.body.user_id, (user, error) => {
        if (error) {
          console.log(`SendBird Connection error: ${error}`);
        } else {
          console.log(`SendBird should be connected! User is: ${this.state.userID}`);
          this.setState({
            userID: res.body.user_id,
            userNick: res.body.nickname,
            profileURL: res.body.profile_url,
            loggedIn: true,
          });
          sbactions.loadOnlineUsersList();
          sbactions.makeChannelHandler();
        }
      });
    } else {
      console.log(`SendBird User Creation ERROR:
      Server response ${res.status} ${res.statusText}`);
    }
  }

  static createUserFailed(err) {
    console.log(`SendBird User Creation ERROR. ERROR: ${err}`);
  }

  loadOnlineUsersListCompleted(res) {
    if (res.status === 200) {
      console.log('SendBird User List GET: Server response 200 (OK)');
      this.setState({
        userList: res.body.users,
      });
      console.log('User List: ');
      console.log(this.state.userList);
    } else {
      console.log(`SendBird User List GET ERROR:
      Server response ${res.status} ${res.statusText}`);
    }
  }

  static loadOnlineUsersListFailed(err) {
    console.log(`SendBird User List GET ERROR. ERROR: ${err}`);
  }

  createChannelCompleted(res) {
    if (res.status === 200) {
      console.log('SendBird Channel Creation: Server response 200 (OK)');
      this.setState({ currentChannel: res });
    } else {
      console.log(`SendBird Channel Creation ERROR:
      Server response ${res.status} ${res.statusText}`);
    }
  }

  static createChannelFailed(err) {
    console.log(`SendBird Channel Creation ERROR. ERROR: ${err}`);
  }

  fireNewNotification(mess) {
    const messageString = `${mess.message} - ${mess.sender.nickname}`;
    console.log('Firing a notification action');
    this.setState({
      snackbarOpen: true,
    });
    console.log(this.state.snackbarOpen);
    this.setState({
      snackbarOpen: true,
      newMsgContent: messageString,
    });
    console.log(this.state.snackbarOpen);
  }

  // sendMessageCompleted(res) {
  //   if (res.status === 200) {
  //     console.log('SendBird Message Sent: Server response 200 (OK)');
  //     this.state.messagesSen.push(res);
  //   } else {
  //     console.log(`SendBird Message Send ERROR:
  //     Server response ${res.status} ${res.statusText}`);
  //   }
  // }

  // static sendMessageFailed(err) {
  //   console.log(`SendBird Message Sending ERROR. ERROR: ${err}`);
  // }
}

/* Function to creat new user
if it isn't exists
*/
sbactions.createUser.listen((userid, nick) => {
  request.post('https://api.sendbird.com/v3/users')
    .set('Content-Type', 'application/json', 'charset=utf8')
    .set('Api-Token', API_TOKEN)
    .send({
      user_id: userid,
      nickname: nick,
      profile_url: '',
    })
    .end((err, res) => {
      if (err || !res.ok) {
        console.log(`Error creating SendBird User: ${JSON.stringify(err)}`);
        sbactions.createUser.failed(err);
      } else {
        console.log(`SendBird user creation done: ${JSON.stringify(res.body)}`);
        sbactions.createUser.completed(res);
      }
    });
});

sbactions.loadOnlineUsersList.listen(() => {
  request.get('https://api.sendbird.com/v3/users?limit=10')
    .set('Content-Type', 'application/json', 'charset=utf8')
    .set('Api-Token', API_TOKEN)
    .end((err, res) => {
      if (err || !res.ok) {
        console.log(`Error getting user list: ${JSON.stringify(err)}`);
        sbactions.loadOnlineUsersList.failed(err);
      } else {
        console.log(`User list GET success: ${JSON.stringify(res.body)}`);
        sbactions.loadOnlineUsersList.completed(res);
      }
    });
});


// sbactions.createChannel.listen((userID, otherUserID) => {
//   request.get('https://api.sendbird.com/v3/group_channels')
//     .set('Content-Type', 'application/json', 'charset=utf8')
//     .set('Api-Token', API_TOKEN)
//     .send({
//       name: `Chat with ${otherUserID}`,
//       cover_url: 'https://sendbird.com/main/img/cover/cover_08.jpg',
//       custom_type: 'personal',
//       data: '',
//       user_ids: [userID, otherUserID],
//       is_distinct: true,
//     })
//     .end((err, res) => {
//       if (err || !res.ok) {
//         console.log(`Error creating 1-1 channel: ${JSON.stringify(err)}`);
//         sbactions.createChannel.failed(err);
//       } else {
//         console.log(`1-1 channel creation success: ${JSON.stringify(res.body)}`);
//         sbactions.createChannel.completed(res);
//       }
//     });
// });

// sbactions.sendMessage.listen((channelType, channelUrl, userID, message) => {
//   request.post(`https://api.sendbird.com/v3/${channelType}/${channelUrl}/messages`)
//     .set('Content-Type', 'application/json', 'charset=utf8')
//     .set('Api-Token', API_TOKEN)
//     .send({
//       message_type: 'MESG',
//       user_id: userID,
//       message,
//     })
//     .end((err, res) => {
//       if (err || !res.ok) {
//         console.log(`Error sending SendBird message: ${JSON.stringify(err)}`);
//         sbactions.sendMessage.failed(err);
//       } else {
//         console.log(`SendBird message sent: ${JSON.stringify(res.body)}`);
//         sbactions.sendMessage.completed(res);
//       }
//     });
// });

export default sbStore;
