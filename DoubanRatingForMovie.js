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
// @supportURL   https://github.com/ciphersaw/DoubanRatingForMovie/issues
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
    error(...args) {
        if (this.currentLogLevel >= LOG_LEVELS.ERROR) {
            console.error(...args);
        }
    }
    info(...args) {
        if (this.currentLogLevel >= LOG_LEVELS.INFO) {
            console.info(...args);
        }
    }
    debug(...args) {
        if (this.currentLogLevel >= LOG_LEVELS.DEBUG) {
            console.debug(...args);
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
            OLEVOD_setMainRating(data.ratingNums, data.url);
        })
        .catch(err => {
            OLEVOD_setMainRating("N/A", DOUBAN_RATING_API + title);
        });
}

function OLEVOD_getTitle() {
    let title = $('h2.title').clone();
    title.children().remove();
    return title.text().trim();
}

function OLEVOD_setMainRating(ratingNums, url) {
    const doubanLink = `<a href="${url}" target="_blank">豆瓣评分：${ratingNums}</a>`;
    if (OLEVOD_isDetailPage()) {
        let ratingObj = $('.content_detail .data>.text_muted:first-child');
        ratingObj.empty();
        ratingObj.append(doubanLink);
    } else if (OLEVOD_isPlayPage()) {
        let ratingObj = $('.play_text .nstem');
        const replacedText = ratingObj.html().replace('豆瓣评分：', '');
        ratingObj.html(replacedText);
        ratingObj.append(doubanLink);
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
    logger.info(`getDoubanRating: title=${title} url=${url}`);

    const ratingData = await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            "method": "GET",
            "url": url,
            "onload": (r) => {
                const response = $($.parseHTML(r.response));
                if (r.status !== 200) {
                    reject(new Error(`StatusError: response status is ${r.status} and message is ${r.statusText}`));
                } else {
                    try {
                        let data = resolveDoubanRatingResult(url, response);
                        logger.info(`getDoubanRating: title=${title} rating=${data.ratingNums}`);
                        resolve(data);
                    } catch (error) {
                        logger.error(`getDoubanRating: title=${title} error=${err}`);
                        reject(error);
                    }
                }
            }
        });
    });
    return ratingData;
}

function resolveDoubanRatingResult(searchURL, data) {
    const s = data.find('.result-list .result:first-child');
    if (s.length === 0) {
        throw Error("ResolveError: search result not found");
    }
    const ratingNums = s.find('.rating_nums').text() || '暂无评分';
    const doubanLink = s.find('.content .title a').attr('href') || '';
    const url = resolveDoubanURL(searchURL, doubanLink);
    const ratingData = {
        ratingNums,
        url
    }
    return ratingData;
}

function resolveDoubanURL(searchURL, doubanLink) {
    try {
        return (new URL(doubanLink)).searchParams.get('url');
    } catch (error) {
        logger.error(`resolveDoubanURL: error=${error.message}`);
        return searchURL;
    }
}