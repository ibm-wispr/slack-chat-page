(() => {
  class ChatController {
    /* @ngInject */
    constructor($scope, $log, $state, ChatService) {

      const vm = this;

      vm.chatService = ChatService;
      vm.loggedIn = vm.chatService.loggedIn;
      vm.chatMessages
      vm.chatUser = {};
      vm.newMessage;
      vm.user = {}
      vm.chatgroups = vm.chatService.chatGroup;

      //watch chatgroup response from slack.  Angular updates page when slack responds.
      $scope.$watch('ctrl.chatService.chatGroup', () => {
        vm.chatgroups = vm.chatService.chatGroup;
      });

      //watch for the current user info after logged into slack.
      $scope.$watch('ctrl.chatService.user', () => {
        vm.user = vm.chatService.user;
        //console.log(vm.user);
      });

      //set loggedIn flag to true after user is logged in to slack.  Then get the Chat groups
      $scope.$watch('ctrl.chatService.loggedIn', () => {
        vm.loggedIn = vm.chatService.loggedIn;
        if (vm.loggedIn){
          vm.chatService.getChatGroups();
        }
      });

      //watch for login response from slack.  Needed for oauth callback
      $scope.$watch(() => $state.params, ({ code }) => {
        vm.chatService.login($state.params.code);
      })

      //watch for slack messages when a new chat is opened and update the ui with the responses.
      $scope.$watch('ctrl.chatService.chatMessages', () => {
        vm.chatMessages = vm.chatService.chatMessages;
      });

      //open a direct message chat, store chat name and id
      vm.openChat = function openChat(chatId, chatName) {
        vm.chatUser.id = chatId;
        vm.chatUser.name = chatName;
        vm.chatService.openChat(chatId);
        $log.info(`Switch to ${chatId}`);
      };

      //send a message
      vm.sendMessage = function(){
        $log.info(`Sending message {$scope.newMessage}`)
        vm.chatService.sendMessage($scope.newMessage, vm.chatUser.id);
        $scope.newMessage = '';
      }

      //this is used to fill out the username in the chat window.  Slack provides id, but not username
      vm.getUsername = function(userid){
        if (vm.chatUser.id == userid){
          return vm.chatUser.name;
        }else{
          return vm.user.name;
        }
      }
    }
  }

  ChatController.$inject = ['$scope', '$log', '$state', 'ChatService'];

  angular
    .module('ngcControllers')
    .controller('ChatController', ChatController);

//adding two directives for submit on enter and scrolling to bottom of the chat window.
//Ideally, this would be in a separate directive file, but added here for simplicity and easier reading purposes
    angular.module('ngcControllers').directive('ngEnter', function() {
            return function(scope, element, attrs) {
                element.bind("keydown keypress", function(event) {
                    if(event.which === 13) {
                        scope.$apply(function(){
                            scope.$eval(attrs.ngEnter, {'event': event});
                        });

                        event.preventDefault();
                    }
                });
            };
        });

  angular.module('ngcControllers').directive('scrollToBottom', function($timeout, $window) {
        return {
            scope: {
                scrollToBottom: "="
            },
            restrict: 'A',
            link: function(scope, element, attr) {
                scope.$watchCollection('scrollToBottom', function(newVal) {
                    if (newVal) {
                        $timeout(function() {
                            element[0].scrollTop =  element[0].scrollHeight;
                        }, 0);
                    }

                });
            }
        };
    });
})();
