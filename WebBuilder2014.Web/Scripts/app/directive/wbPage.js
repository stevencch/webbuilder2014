wbApp.directive('wbPage', ['$timeout', '$document', function ($timeout, $document) {
    return {
        templateUrl: '/Scripts/app/template/wbPage.html' + "?" + (new Date().getTime()).toString(),
        controller: 'wbController',
        link: function (scope, element, attr, ctrl) {
            $timeout(scope.afterRender, 0);
        }
    }
}]);