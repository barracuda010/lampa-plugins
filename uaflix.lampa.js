(function () {
    'use strict';

    if (!window.Lampa) return;

    var DOMAIN = 'https://uaflix.net';

    /* =========================
       SOURCE (картки фільмів)
    ========================== */

    var source = {
        name: 'UAFlix',
        description: 'Фільми з uaflix.net',
        version: '1.1.0',
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

                // КЛЮЧОВЕ
                type: 'movie',
                source: 'uaflix',
                playable: true
            });
        });

        return items;
    }

    Lampa.Source.add(source);

    /* =========================
       PLAYER (відтворення)
    ========================== */

    Lampa.Listener.follow('player', function (e) {
        if (e.type !== 'start') return;
        if (!e.url || e.url.indexOf('uaflix.net') === -1) return;

        Lampa.Player.stop();
        loadPlayer(e.url);
    });

    function loadPlayer(pageUrl) {
        Lampa.Utils.get(pageUrl, function (html) {

            var match = null;

            // 1. file:"https://..."
            match = html.match(/file\s*:\s*"(https?:\/\/[^"]+)"/);

            // 2. <video src="">
            if (!match) {
                match = html.match(/<video[^>]+src="([^"]+)"/);
            }

            // 3. iframe
            if (!match) {
                match = html.match(/<iframe[^>]+src="([^"]+)"/);
            }

            if (match && match[1]) {
                Lampa.Player.play({
                    url: match[1],
                    title: 'UAFlix',
                    type: match[1].includes('.m3u8') ? 'hls' : 'video'
                });
            } else {
                Lampa.Noty.show('UAFlix: відео не знайдено');
            }

        }, function () {
            Lampa.Noty.show('UAFlix: помилка завантаження сторінки');
        });
    }

    /* =========================
       SETTINGS
    ========================== */

    Lampa.SettingsApi.addParam({
        component: 'uaflix',
        param: {
            name: 'enabled',
            type: 'toggle',
            default: true
        },
        field: {
            name: 'UAFlix (джерело)'
        }
    });

    console.log('UAFlix plugin loaded');
})();
