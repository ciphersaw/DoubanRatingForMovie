// ==UserScript==
// @name         DoubanRatingForMovie
// @name:zh-CN   在线电影添加豆瓣评分
// @namespace    https://github.com/ciphersaw/DoubanRatingForMovie
// @version      1.0.0
// @description  Display Douban rating for online movies.
// @description:zh-CN  在主流电影网站上显示豆瓣评分。
// @author       CipherSaw
// @match        *://*.olevod.com/index.php*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @connect      douban.com
// @license      GPL-3.0
// @grant        GM_xmlhttpRequest
// @downloadURL  https://update.greasyfork.org/scripts/494757/DoubanRatingForMovie.user.js
// @updateURL    https://update.greasyfork.org/scripts/494757/DoubanRatingForMovie.meta.js
// ==/UserScript==

'use strict';

const LOG_LEVELS = {
    NONE: 0,
    ERROR: 1,
    INFO: 2,
    DEBUG: 3
};

class Logger {
    constructor(initialLevel = 'INFO') {
        this.currentLogLevel = LOG_LEVELS[initialLevel] || LOG_LEVELS.INFO;
    }
    debug(...args) {
        if (this.currentLogLevel >= LOG_LEVELS.DEBUG) {
            console.debug(...args);
        }
    }
    info(...args) {
        if (this.currentLogLevel >= LOG_LEVELS.INFO) {
            console.info(...args);
        }
    }
    error(...args) {
        if (this.currentLogLevel >= LOG_LEVELS.ERROR) {
            console.error(...args);
        }
    }
}

const logger = new Logger('INFO');
const DOUBAN_RATING_API = 'https://www.douban.com/search?cat=1002&q=';

(function () {
    const host = location.hostname;
    if (host === 'www.olevod.com') {
        OLEVOD_setRating()
    }
})();

function OLEVOD_setRating() {
    const title = OLEVOD_getTitle();
    getDoubanRating(title)
        .then(data => {
            logger.info(`getDoubanRating: title=${title} result=${data}`);
            OLEVOD_setMainRating(data);
        })
        .catch(err => {
            logger.error(`getDoubanRating: title=${title} error=${err}`);
            OLEVOD_setMainRating("N/A");
        });
}

function OLEVOD_getTitle() {
    let title = $('h2.title').clone();
    title.children().remove();
    return title.text().trim();
}

function OLEVOD_setMainRating(rating) {
    if (OLEVOD_isDetailPage()) {
        let ratingObj = $('.content_detail .data>.text_muted:first-child');
        const text = ratingObj.text().trim();
        ratingObj.text(text + rating);
    } else if (OLEVOD_isPlayPage()) {
        let ratingObj = $('.play_text .nstem');
        const replacedText = ratingObj.html().replace('豆瓣评分：', '豆瓣评分：' + rating);
        ratingObj.html(replacedText);
    }
}

function OLEVOD_isDetailPage() {
    return /.+\/vod\/detail\/id\/\d+.*/.test(location.href);
}

function OLEVOD_isPlayPage() {
    return /.+\/vod\/play\/id\/\d+.*/.test(location.href);
}

async function getDoubanRating(title) {
    const url = DOUBAN_RATING_API + title;
    logger.info(`requestDoubanRating: title=${title} url=${url}`);

    const ratingNums = await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            "method": "GET",
            "url": url,
            "onload": (r) => {
                const response = $($.parseHTML(r.response));
                if (r.status !== 200) {
                    reject(new Error(`StatusError: response status is ${r.status} and message is ${r.statusText}`));
                } else {
                    try {
                        let msg = resolveDoubanRatingResult(response);
                        resolve(msg);
                    } catch (error) {
                        reject(error);
                    }
                }
            }
        });
    });
    return ratingNums;
}

function resolveDoubanRatingResult(data) {
    const s = data.find('.result-list .result:first-child');
    if (s.length === 0) {
        throw Error("ResolveError: search result not found");
    }
    const ratingNums = s.find('.rating_nums').text() || '暂无评分';
    return ratingNums;
}