//add this state to the $stateProvider in tower
      .state('chat', {
        url: '/chat?:code',
        templateUrl: 'components/chat/chat.html',
        controller: 'ChatController',
        controllerAs: 'ctrl',
        data: {
          requiresLogin: false
        }
      })
