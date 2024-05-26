// ==UserScript==
// @name         DoubanRatingForMovie
// @name:zh-CN   在线电影添加豆瓣评分
// @namespace    https://github.com/ciphersaw/DoubanRatingForMovie
// @version      1.0.3
// @description  Display Douban rating for online movies.
// @description:zh-CN  在主流电影网站上显示豆瓣评分。
// @author       CipherSaw
// @match        *://*.olehdtv.com/index.php*
// @match        *://*.olevod.com/details*
// @match        *://*.olevod.com/player/vod/*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @connect      douban.com
// @license      GPL-3.0
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
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
const TERM_OF_VALID_CACHE = 1;
const PERIOD_OF_CLEARING_CACHE = 1;
const DOUBAN_RATING_API = 'https://www.douban.com/search?cat=1002&q=';

(function () {
    clearExpiredCache();
    const host = location.hostname;
    if (host === 'www.olehdtv.com') {
        OLEHDTV_setRating();
    } else if (host === 'www.olevod.com') {
        OLEVOD_setRating();
    }
})();

// ==OLEHDTV==
function OLEHDTV_setRating() {
    const id = OLEHDTV_getID();
    const title = OLEHDTV_getTitle();
    getDoubanRating(`olehdtv_${id}`, title)
        .then(data => {
            OLEHDTV_setMainRating(data.ratingNums, data.url);
        })
        .catch(err => {
            OLEHDTV_setMainRating("N/A", DOUBAN_RATING_API + title);
        });
}

function OLEHDTV_getID() {
    const id = /id\/(\d+)/.exec(location.href);
    return id ? id[1] : 0;
}

function OLEHDTV_getTitle() {
    let clone = $('h2.title').clone();
    clone.children().remove();
    return clone.text().trim().replace(/【.*】$/, ''); // Remove the annotated suffix of title
}

function OLEHDTV_setMainRating(ratingNums, url) {
    const doubanLink = `<a href="${url}" target="_blank">豆瓣评分：${ratingNums}</a>`;
    if (OLEHDTV_isDetailPage()) {
        let ratingObj = $('.content_detail .data>.text_muted:first-child');
        ratingObj.empty();
        ratingObj.append(doubanLink);
    } else if (OLEHDTV_isPlayPage()) {
        let ratingObj = $('.play_text .nstem');
        const replacedHTML = ratingObj.html().replace('豆瓣评分：', '');
        ratingObj.html(replacedHTML);
        ratingObj.append(doubanLink);
    }
}

function OLEHDTV_isDetailPage() {
    return /.+\/vod\/detail\/id\/\d+.*/.test(location.href);
}

function OLEHDTV_isPlayPage() {
    return /.+\/vod\/play\/id\/\d+.*/.test(location.href);
}

// ==OLEVOD==
async function OLEVOD_setRating() {
    const id = OLEVOD_getID();
    let title = '';
    try {
        title = await OLEVOD_waitForTitle(1000, 10);
    } catch (error) {
        logger.error(`OLEVOD_waitForTitle: id=${id} error=${error}`);
        return;
    }
    getDoubanRating(`olevod_${id}`, title)
        .then(data => {
            OLEVOD_setMainRating(data.ratingNums, data.url);
        })
        .catch(err => {
            OLEVOD_setMainRating("N/A", DOUBAN_RATING_API + title);
        });
}

function OLEVOD_getID() {
    const id = /\d{1}-\d{5}/.exec(location.href);
    return id ? id[0] : 0;
}

function OLEVOD_waitForTitle(delay, iterations) {
    let selector = '';
    if (OLEVOD_isDetailPage()) {
        selector = ".pc-container .info .title";
    } else if (OLEVOD_isPlayPage()) {
        selector = ".el-tabs__content .tab-label";
    }
    return new Promise((resolve, reject) => {
        let count = 0;
        const intervalID = setInterval(() => {
            count++;
            if (count === iterations) {
                const error = new Error(`ResolveError: title is not found and iterations have reached the maximum`);
                clearInterval(intervalID);
                reject(error);
            }
            const obj = $(selector);
            if (obj) {
                const title = OLEVOD_resolveTitle(obj);
                if (title !== "") {
                    clearInterval(intervalID);
                    resolve(title);
                }
            }
        }, delay);
    });
}

function OLEVOD_resolveTitle(obj) {
    const suffixRegex = /【.*】$/; // Remove the annotated suffix of title
    if (OLEVOD_isDetailPage()) {
        return obj.text().trim().replace(suffixRegex, '');
    } else if (OLEVOD_isPlayPage()) {
        const clone = obj.clone();
        clone.children().remove();
        return clone.text().trim().replace(suffixRegex, '');
    }
}

function OLEVOD_setMainRating(ratingNums, url) {
    if (OLEVOD_isDetailPage()) {
        let ratingObj = $('.pc-container .info .label:first-child');
        ratingObj.before(`<span class="label"><a href="${url}" target="_blank" style="color: white">豆瓣评分：${ratingNums}</a></span>`);
    } else if (OLEVOD_isPlayPage()) {
        let ratingObj = $('#pane-first .tab-label .wes');
        const clone = ratingObj.clone();
        clone.children().remove();
        const originalText = clone.text().trim();
        const array = originalText.split(/ +/);
        if (array.length === 2) {
            const revisedText = `${array[0]} <a href="${url}" target="_blank" style="color: #798499">豆瓣${ratingNums}</a>/${array[1]}`;
            const replacedHTML = ratingObj.html().replace(originalText, revisedText);
            ratingObj.html(replacedHTML);
        }

    }
}

function OLEVOD_isDetailPage() {
    return /.+\/details-\d{1}-\d{5}\.html/.test(location.href);
}

function OLEVOD_isPlayPage() {
    return /.+\/player\/vod\/\d{1}-\d{5}-\d{1}\.html/.test(location.href);
}

// ==COMMON==
function clearExpiredCache() {
    const t = GM_getValue('clear_time');
    if (!t || !isValidTime(new Date(t), PERIOD_OF_CLEARING_CACHE)) {
        logger.info(`clearExpiredCache: clear_time=${t}`);
        const idList = GM_listValues();
        idList.forEach(function (id) {
            // Delete the expired IDs periodically
            const data = GM_getValue(id);
            if (data.uptime && !isValidTime(new Date(data.uptime), TERM_OF_VALID_CACHE)) {
                GM_deleteValue(id);
            }
        });
        GM_setValue('clear_time', new Date().toISOString());
    }
}

async function getDoubanRating(key, title) {
    const data = GM_getValue(key);
    if (data && isValidTime(new Date(data.uptime), TERM_OF_VALID_CACHE)) {
        logger.info(`getDoubanRating: title=${title} rating=${data.ratingData.ratingNums} uptime=${data.uptime}`);
        return data.ratingData;
    }

    const url = DOUBAN_RATING_API + title;
    logger.info(`getDoubanRating: title=${title} searchURL=${url}`);

    const ratingData = await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            "method": "GET",
            "url": url,
            "onload": (r) => {
                const response = $($.parseHTML(r.response));
                if (r.status !== 200) {
                    const error = new Error(`StatusError: response status is ${r.status} and message is ${r.statusText}`);
                    reject(error);
                } else {
                    try {
                        let data = resolveDoubanRatingResult(url, response);
                        logger.info(`getDoubanRating: title=${title} rating=${data.ratingNums}`);
                        resolve(data);
                    } catch (error) {
                        logger.error(`getDoubanRating: title=${title} error=${error}`);
                        reject(error);
                    }
                }
            }
        });
    });

    cacheDoubanRatingData(key, ratingData);
    return ratingData;
}

function isValidTime(uptime, term) {
    const oneDayMillis = 24 * 60 * 60 * 1000;
    const nowDate = new Date();
    const diffMillis = nowDate.getTime() - uptime.getTime();
    return diffMillis < oneDayMillis * term;
}

function cacheDoubanRatingData(key, ratingData) {
    const uptime = new Date().toISOString();
    const data = {
        ratingData,
        uptime
    };
    GM_setValue(key, data);
}

function resolveDoubanRatingResult(searchURL, data) {
    const s = data.find('.result-list .result:first-child');
    if (s.length === 0) {
        throw Error("ResolveError: search result is not found");
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