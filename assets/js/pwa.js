/**
 * Clear caches
 */
function pwaClearCaches()
{
    //Clear caches
    caches.keys().then(function(names) {
        for (let name of names) {
            caches.delete(name);
        }
    });
}

var pwa_app_installed = false; //PWA is already installed
var deferredPrompt; //Link to show dialog event
$(document).ready(function(){
    if (window.location.protocol === 'http:') { //Если это HTTP протокол, а не HTTPS
        console.log(lang.t('You need HTTPS for work'));
    }

    if ('serviceWorker' in navigator) {
        /**
         * Подвешиваемся на переключение режима правки, чтобы сразу очистить кэш
         */
        $('.debug-mode-switcher').on('click', function () {
            if (!$('.debug-mode-switcher .toggle-switch').hasClass('on')) {
                //Delete service worker
                navigator.serviceWorker.getRegistrations().then(function (registrations) {
                    for (let registration of registrations) {
                        registration.unregister();
                    }
                });

                //Clear caches
                pwaClearCaches();
            }
        });
    }

    if ($.cookie('update_pwa_cache')){ //Update cache if we have cookie на обновление
        pwaClearCaches();
        $.cookie('update_pwa_cache', '', {expires: -1});
    }

    /**
     * Close window with prompt
     */
    function closePWAInstallWindow()
    {
        $("#pwaInstall").hide();
        $.cookie('not_show_pwa', '1');
    }

    let body = $('body');
    /**
     * Add to homescreen event 
     */
    body.on('click', '#pwaAddToHomeScreen', function(){
        deferredPrompt.prompt(); // Show alert to install
        deferredPrompt.userChoice.then((choiceResult) => {//Wait for user choose
            if (choiceResult.outcome === 'accepted') { //Accept install
                closePWAInstallWindow();
            } else { //Cansel install
                closePWAInstallWindow();
            }
            deferredPrompt = null;
        });
        return false;
    });
    /**
     * Close intalll window
     */
    body.on('click', '#pwaCloseInstall', function(){
        closePWAInstallWindow();
        return false;
    });
});


console.log('out');

//If we not in webapp and no session that we need to install
if (!(window.matchMedia('(display-mode: standalone)').matches) && !$.cookie('not_show_pwa')) {
    /**
     * Event that app is installed
     */
    $(window).on('appinstalled', (evt) => {
        pwa_app_installed = true;
    });

    console.log('not fired');

    /**
     * Event beforeinstallprompt from browser
     */
    $(window).on('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e.originalEvent;
        console.log('fired');

        var is_mobile_android = false;
        var ua = navigator.userAgent;

        if (/Android/i.test(ua) && /Chrome/i.test(ua)){ //If we in Android and it is Chrome prevent native window
            is_mobile_android = true;
        }

        if (!pwa_app_installed && !is_mobile_android){
            let body = $('body');
            body.append('<div id="pwaInstall" class="pwaInstall" style="background-color: #fff">' +
                '<div class="content">Please install our app</div><div class="links">' +
                    '<a href="#" id="pwaAddToHomeScreen" style="background-color: #fff; color: #000;">Add to homescreen</a>' +
                    '<a href="#" id="pwaCloseInstall" style="background-color: yellow; color: black;">No Thanks</a>' +
                '</div>' +
            '</div>');

            setTimeout(function () { //Show our banner
                $("#pwaInstall").addClass('show');
            }, 100);
        }
    });
}