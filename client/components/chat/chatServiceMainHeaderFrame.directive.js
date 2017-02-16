(() => {
  angular.module('ngcDirectives')
  .directive('chatServiceMainHeaderFrame', chatServiceMainHeaderFrame);

  function chatServiceMainHeaderFrame() {
    return {
      restrict: 'EA',
      templateUrl: 'components/chat/chatServiceMainHeaderFrame.html',
      controller: 'ChatServiceMainHeaderFrameController',
      controllerAs: 'ctrl',
      scope: {},
      bindToController: true,
    };
  }
})();
