(function () {
    'use strict';

    if (!window.Lampa) return;

    var DOMAIN = 'https://uaflix.net';

    /* =========================
       SOURCE
    ========================== */

    var source = {
        name: 'UAFlix',
        description: 'UAFlix.net',
        version: '1.0.0',
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
            var href = a.getAttribute('href') || '';
            if (!href.includes('/film') && !href.includes('/series')) return;

            var title = a.querySelector('img')?.getAttribute('alt');
            var poster = a.querySelector('img')?.getAttribute('src');

            if (!title || !poster) return;

            items.push({
                title: title.trim(),
                poster: poster,
                url: DOMAIN + href,
                type: 'movie'
            });
        });

        return items;
    }

    Lampa.Source.add(source);

    /* =========================
       PLAYER
    ========================== */

    Lampa.Listener.follow('player', function (e) {
        if (e.type !== 'start') return;
        if (!e.url || e.url.indexOf('uaflix.net') === -1) return;

        Lampa.Player.stop();
        loadPlayer(e.url);
    });

    function loadPlayer(pageUrl) {
        Lampa.Utils.get(pageUrl, function (html) {

            // 1. file:"..."
            var match = html.match(/file\s*:\s*"(https?:\/\/[^"]+)"/);

            // 2. <video src="">
            if (!match) {
                match = html.match(/<video[^>]+src="([^"]+)"/);
            }

            // 3. iframe
            if (!match) {
                match = html.match(/<iframe[^>]+src="([^"]+)"/);
            }

            if (match) {
                Lampa.Player.play({
                    url: match[1],
                    title: 'UAFlix',
                    type: 'hls'
                });
            } else {
                Lampa.Noty.show('UAFlix: відео не знайдено');
            }

        }, function () {
            Lampa.Noty.show('UAFlix: помилка завантаження');
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
