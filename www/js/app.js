/* Autor: Luis Bahamonde */

var HeyCommunity = angular.module('starter', [
    'ionic', 'ngCordova',
    'jett.ionic.filter.bar', 'ion-gallery', 'jett.ionic.scroll.sista', 'ngIOS9UIWebViewPatch', 'ion-affix',
    'pascalprecht.translate', 'ngFileUpload', 'ngImgCrop',
    'hc.marked',
])


.run([
    '$ionicPlatform', '$rootScope', '$state', '$stateParams', '$ionicModal', 'UtilityService', 'TimelineService', 'TopicService', 'SystemService', 'UserService', 'UserReportService', '$ionicLoading', '$ionicHistory', '$filter', '$timeout', '$ionicScrollDelegate', 'UserSignInService', 'UserSignUpService', 'CaptchaService',
    function($ionicPlatform, $rootScope, $state, $stateParams, $ionicModal, UtilityService, TimelineService, TopicService, SystemService, UserService, UserReportService, $ionicLoading, $ionicHistory, $filter, $timeout, $ionicScrollDelegate, UserSignInService, UserSignUpService, CaptchaService) {
        //
        // platform ready
        $ionicPlatform.ready(function($rootScope) {
            // keyboard
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                // cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                // cordova.plugins.Keyboard.disableScroll(true);
            }

            // status bar
            if (window.StatusBar) {
                //StatusBar.styleDefault();
                StatusBar.styleLightContent();

                // statusTap scroll to top
                window.addEventListener("statusTap", function() {
                    $ionicScrollDelegate.scrollTop(true);
                });
            }
        });


        //
        // the utility service
        $rootScope.utility = UtilityService;
        $rootScope.utility.serviceRun();


        //
        //
        $rootScope.TimelineService = TimelineService;
        $rootScope.TimelineService.getByLocalStorage();

        $rootScope.TopicService = TopicService;
        $rootScope.TopicService.getByLocalStorage();


        //
        // Set TenantInfo
        if (localStorage.getItem('systemInfo')) {
            var systemInfo = JSON.parse(localStorage.getItem('systemInfo'));
            $rootScope.appSiteTitle = systemInfo.site_name;
        } else {
            $rootScope.appSiteTitle = 'Hey Community';
        }
        SystemService.getTenantInfo().then(function(response) {
            if (typeof response.data === 'object') {
                $rootScope.appSiteTitle = response.data.site_name;
                document.title =  response.data.site_name;
                localStorage.tenantInfo = JSON.stringify(response.data);
            }
        });


        //
        // user
        UserService.user().then(function(response) {
            if (response.status === 200) {
                $rootScope.user = response.data;
            } else {
                if (isWeChatBrowser()) {
                    location.assign('http://www.hey-community.com/api/wechat/o-auth');
                }
            }
        });


        //
        // user modal
        $rootScope.UserSignUpService    =   UserSignUpService;
        $rootScope.UserSignInService    =   UserSignInService;
        $rootScope.UserReportService    =   UserReportService;
        $rootScope.CaptchaService       =   CaptchaService;

        $ionicModal.fromTemplateUrl('templates/user/user-signUp.html', {
            scope: $rootScope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $rootScope.signUpModal = modal;
        });

        $ionicModal.fromTemplateUrl('templates/user/user-signIn.html', {
            scope: $rootScope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $rootScope.signInModal = modal;
        });

        $ionicModal.fromTemplateUrl('templates/user/user-report.html', {
            scope: $rootScope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $rootScope.reportModal = modal;
        });


        //
        // functions
        $rootScope.getPicUrl = getPicUrl;
        $rootScope.getApiUrl = getApiUrl;
        $rootScope.getMomentDate = getMomentDate;

        $rootScope.state = $state;
        $rootScope.filter = $filter;
        $rootScope.timeout = $timeout;
        $rootScope.stateParams = $stateParams;
        $rootScope.ionicHistory = $ionicHistory;
        $rootScope.user = localStorage.user ? JSON.parse(localStorage.user) : {};
        $rootScope.badgeNum = 0;


        //
        // loading state
        $rootScope.$on('loading:show', function() {
            $ionicLoading.show({template: '<ion-spinner></ion-spinner>'})
        })
        $rootScope.$on('loading:hide', function() {
            $ionicLoading.hide()
        })
        $rootScope.$on('notice:show', function(event, text) {
            $ionicLoading.show({template: text})
        })
        $rootScope.$on('notice:hide', function() {
            $ionicLoading.hide()
        })
    }
])


.config(['$ionicFilterBarConfigProvider', '$ionicConfigProvider', '$httpProvider', '$translateProvider', function($ionicFilterBarConfigProvider, $ionicConfigProvider, $httpProvider, $translateProvider) {
    //
    // set language
    if (!localStorage.appLanguage) {
        $translateProvider.useSanitizeValueStrategy(null);
        if (getLang() == 'zh-cn' || getLang() == 'ZH-cn') {
            $translateProvider.preferredLanguage('zh-cn');
            localStorage.appLanguage = 'zh-cn';
        } else if (getLang() == 'en-us' || getLang() == 'EN-us') {
            $translateProvider.preferredLanguage('en-us');
            localStorage.appLanguage = 'en-us';
        } else {
            $translateProvider.preferredLanguage('zh-cn');
            localStorage.appLanguage = 'zh-cn';
        }
    } else {
        $translateProvider.useSanitizeValueStrategy(null);
        $translateProvider.preferredLanguage(localStorage.appLanguage);
    }

    //
    // filterBar config
    $ionicFilterBarConfigProvider.theme('light');
    $ionicFilterBarConfigProvider.clear('ion-close');
    $ionicFilterBarConfigProvider.search('ion-search');
    $ionicFilterBarConfigProvider.backdrop(true);
    $ionicFilterBarConfigProvider.transition('vertical');
    $ionicFilterBarConfigProvider.placeholder('Search...');


    //
    // backButton config
    $ionicConfigProvider.backButton.previousTitleText(false);
    $ionicConfigProvider.backButton.text('');


    //
    // navbar config
    $ionicConfigProvider.navBar.alignTitle('center');   // Places them at the bottom for all OS


    //
    // tabs config
    $ionicConfigProvider.tabs.position('bottom');   // Places them at the bottom for all OS
    $ionicConfigProvider.tabs.style('standard');    // Makes them all look the same across all OS


    //
    // http provider config
    $httpProvider.defaults.timeout = 5000;

    $httpProvider.defaults.headers.common.domain = API.substring(0, API.length - 4);

    $httpProvider.interceptors.push(['$rootScope', function($rootScope) {
        return {
            request: function(config) {
                if ($rootScope.loadingShowDisabled) {
                    $rootScope.loadingShowDisabled = false;
                } else {
                    $rootScope.$broadcast('loading:show');
                }
                return config;
            },
            response: function(response) {
                $rootScope.$broadcast('loading:hide');
                return response;
            },
            requestError: function(response) {
                $rootScope.$broadcast('loading:hide');
                return response;
            },
            responseError: function(response) {
                $rootScope.$broadcast('loading:hide');
                return response;
            }
        }
    }])
}])
