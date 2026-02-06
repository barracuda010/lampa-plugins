(function () {
    'use strict';

    if (!window.Lampa) return;

    var DOMAIN = 'https://uaflix.net';
    var PROVIDER_NAME = 'uaflix';

    /* =========================
       SOURCE (картки)
    ========================== */

    var source = {
        name: PROVIDER_NAME,
        description: 'UAFlix.net',
        version: '1.3.0',
        type: 'video',

        search: function (query, callback) {
            loadList(DOMAIN + '/search/?q=' + encodeURIComponent(query), callback);
        },

        popular: function (callback) {
            loadList(DOMAIN + '/', callback);
        }
    };

    function loadList(url, callback) {
        Lampa.Utils.get(url, function (html) {
            callback(parseList(html));
        }, function () {
            callback([]);
        });
    }

    function parseList(html) {
        var items = [];
        var doc = document.createElement('div');
        doc.innerHTML = html;

        doc.querySelectorAll('a').forEach(function (a) {
            var href = a.getAttribute('href');
            if (!href) return;

            if (!href.includes('/film') && !href.includes('/series')) return;

            var img = a.querySelector('img');
            if (!img) return;

            var title = img.getAttribute('alt');
            var poster = img.getAttribute('src');
            if (!title || !poster) return;

            items.push({
                title: title.trim(),
                original_title: title.trim(),
                poster: poster,
                url: DOMAIN + href,

                type: 'movie',

                // КЛЮЧОВЕ
                source: PROVIDER_NAME,
                provider: PROVIDER_NAME,
                playable: true
            });
        });

        return items;
    }

    Lampa.Source.add(source);

    /* =========================
       PROVIDER (меню "Дивитись")
    ========================== */

    Lampa.Provider.add({
        name: PROVIDER_NAME,
        title: 'UAFlix',
        search: function (object, callback) {
            extractVideo(object.url, callback);
        }
    });

    function extractVideo(pageUrl, callback) {
        Lampa.Utils.get(pageUrl, function (html) {

            var match =
                html.match(/file\s*:\s*"(https?:\/\/[^"]+)"/) ||
                html.match(/<video[^>]+src="([^"]+)"/) ||
                html.match(/<iframe[^>]+src="([^"]+)"/);

            if (match && match[1]) {
                callback([{
                    title: 'UAFlix',
                    url: match[1],
                    quality: 'Auto',
                    type: match[1].includes('.m3u8') ? 'hls' : 'video'
                }]);
            } else {
                callback([]);
            }

        }, function () {
            callback([]);
        });
    }

    console.log('UAFlix source + provider loaded');
})();