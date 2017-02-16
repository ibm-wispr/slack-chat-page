(function () {
  angular
    .module('ngcServices')
    .factory('ChatService', ChatService);
  //angular.module('ngcServices', ['ngWebSocket']);
  ChatService.$inject = ['$log', 'store','$window', 'Message', 'Search', 'UserService', '$rootScope', '$http'];
  /* @ngInject */
  let SLACK_TOKEN = "SLACK_TOKEN";
  function ChatService($log, store, $window, Message, Search, UserService, $rootScope, $http) {
    const obj = {};
    obj.chatMessages = new Array();
    obj.chatGroup = [];
    obj.token = '{SLACK_TOKEN}';
    obj.client_id = '{SLACK_CLIENT_ID}';
    obj.client_secret = '{SLACK_CLIENT_SECRET}';
    obj.channel_id;
    obj.loggedIn = false;
    obj.user ={};
    obj.lastMessage;
    obj.messageInterval;

    if (store.get(SLACK_TOKEN)){
      obj.loggedIn = true;
      obj.token = store.get(SLACK_TOKEN);
    }

    //populates all the direct messages.  use channels.list for channels instead of DM's.
    obj.getChatGroups = function () {
      $http({
        method: 'GET',
        url: 'https://slack.com/api/users.list',
        skipAuthorization:true,
        params:{token:obj.token},
      }).then((response) =>{
        obj.chatGroup = response.data.members;
      //  $log.info(response.data);
      },(error) =>{
        $log.error(error);
      });
    };

    //open a direct message with the person with the given id.
    obj.openChat = function (id){
      $http({
        method: 'GET',
        url: 'https://slack.com/api/im.open',
        skipAuthorization:true,
        params:{token:obj.token,user:id},
      }).then((response) =>{
        //store the current channel id
        obj.channel_id = response.data.channel.id;
        //get the history of the channel
        $http({
          method: 'GET',
          url: 'https://slack.com/api/im.history',
          skipAuthorization:true,
          params:{token:obj.token,channel:response.data.channel.id},
        }).then((response) =>{
          obj.chatMessages = response.data.messages;
          //store the timestamp of the last message
          if (response.data.latest){
            obj.lastMessage = response.data.latest;
          }else if (response.data.messages.length > 0){
            obj.lastMessage = response.data.messages[0].ts;
          }

          //begin listening for messages.  Ideally we would use websockets to the Slack RTM Api.
          //messageInterval is the id of the polling function.  Clear it if it exists and start a new one.
          if (obj.messageInterval){
            clearInterval(obj.messageInterval);
          }
          obj.messageInterval = setInterval(function(){
            obj.getMessages();
          },5000);
          //$log.info(response);
        },(error) =>{
          $log.error(error);
        });
      },(error) =>{
        $log.error(error);
      });
    }

    //check to see if the user token is still valid and login the user if it is.  If its not, remove it from the session store and reset the service.
    obj.initCurrentUser = function(){
      if (store.get(SLACK_TOKEN)){
        $http({
          method: 'GET',
          url: 'https://slack.com/api/auth.test',
          skipAuthorization:true,
          params:{token:store.get(SLACK_TOKEN)},
        }).then((response) =>{
          //obj.chatGroup = response.data.members;
          if (response.data.ok){
            obj.loggedIn = true;
            obj.user.name = response.data.user;
            return true;
          }else{
            store.remove(SLACK_TOKEN);
            obj.loggedIn = false;
            return false;
          }
        },(error) =>{
          $log.error(error);
        })
      }else{
        obj.loggedIn = false;
        return false;
      }
    }

    //login the user if the stored token is invalid
    obj.login = function(code){
      if (!obj.initCurrentUser()){
        $http({
          method: 'GET',
          url: 'https://slack.com/api/oauth.access',
          skipAuthorization:true,
          params:{client_id:obj.client_id,client_secret:obj.client_secret,code:code},
        }).then((response) =>{
          //obj.chatGroup = response.data.members;
          if (response.data.ok){
            $log.info(response.data);
            obj.token = response.data.access_token;
            obj.loggedIn = true;
            obj.user.id = response.data.user_id;
            store.set(SLACK_TOKEN, obj.token);
            obj.initCurrentUser();
          }
        },(error) =>{
          $log.error(error);
        });
      }
    }

    //send a message
    obj.sendMessage = function (message,chatId) {
      $http({
        method: 'GET',
        url: 'https://slack.com/api/chat.postMessage',
        skipAuthorization:true,
        params:{token:obj.token,channel:chatId,text:message, username:UserService.userID, as_user:true},
      }).then((response) =>{
        if (response.data.ok){
          obj.chatMessages.push({ts:response.data.ts,text:message})
          //update the last message timestamp for the polling function
          obj.lastMessage = response.data.ts;
        }
      },(error) =>{
        $log.error(error);
      });
    };

    //get the messages for the channel
    obj.getMessages = function(){
      $http({
        method: 'GET',
        url: 'https://slack.com/api/im.history',
        skipAuthorization:true,
        params:{
          token:obj.token,
          channel:obj.channel_id,
          oldest:obj.lastMessage,
          inclusive:'false'
        },
      }).then((response) =>{
        if (response.data.ok){
          obj.lastMessage = response.data.oldest;
          response.data.messages.forEach((message) => {
            if (message.ts != obj.lastMessage){
              obj.chatMessages.push(message);
              if (message.ts > obj.lastMessage){
                obj.lastMessage = message.ts;
              }
            }
          });
        }
      },(error) =>{
        $log.error(error);
      });
    }

    return obj;
  }
}());
