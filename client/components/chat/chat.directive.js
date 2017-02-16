(function () {
  angular.module('ngcDirectives')
  .directive('chat', Chat);

  function Chat() {
    return {
      restrict: 'EA',
      templateUrl: 'components/chat/chat.html',
      controller: 'ChatController',
      controllerAs: 'ctrl',
      scope: {},
      bindToController: true,
    };
  }
}());
