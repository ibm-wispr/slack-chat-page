(() => {
  let $rootScope;
  let $mdPanel;
  let $state;
  let $log;
  let ChatService;

  class ChatServiceMainHeaderFrameController {
    /* @ngInject */
    constructor(_$rootScope_, _$state_, _$log_, _ChatService_) {
      $rootScope = _$rootScope_;
      $state = _$state_;
      $log = _$log_;
      ChatService = _ChatService_;
    }

    showChat() {
    // return ContactService.loadAddContact();
      $state.go('chat');
    }

  }

  ChatServiceMainHeaderFrameController.$inject = ['$rootScope', '$state', '$log', 'ChatService'];

  angular.module('ngcControllers').controller('ChatServiceMainHeaderFrameController', ChatServiceMainHeaderFrameController);
})();
