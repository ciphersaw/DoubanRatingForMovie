// ==UserScript==
// @name         DoubanRatingForMovie
// @name:zh-CN   在线电影添加豆瓣评分
// @namespace    https://github.com/ciphersaw/DoubanRatingForMovie
// @version      1.1.0
// @description  Display Douban rating for online movies.
// @description:zh-CN  在主流电影网站上显示豆瓣评分。
// @author       CipherSaw
// @match        *://*.olehdtv.com/index.php*
// @match        *://*.olevod.com/details*
// @match        *://*.olevod.com/player/vod/*
// @match        *://*.olevod.tv/details*
// @match        *://*.olevod.tv/player/vod/*
// @match        *://v.qq.com/x/cover/*
// @match        *://www.iqiyi.com/v_*
// @match        *://v.youku.com/v_show/*
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
    } else if (host === 'www.olevod.com' || host === 'www.olevod.tv') {
        // Both main site and test site.
        OLEVOD_setRating();
    } else if (host === 'v.qq.com') {
        VQQ_setRating();
    } else if (host === 'www.iqiyi.com') {
        IQIYI_setRating();
    } else if (host === 'v.youku.com') {
        YOUKU_setRating();
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
            OLEHDTV_setMainRating("N/A", DOUBAN_RATING_API + encodeSpaces(title));
        });
}

function OLEHDTV_getID() {
    const id = /id\/(\d+)/.exec(location.href);
    return id ? id[1] : 0;
}

function OLEHDTV_getTitle() {
    // Remove the annotated suffix of title.
    const suffixRegex = /【.*】$/;
    let clone = $('h2.title').clone();
    clone.children().remove();
    return clone.text().trim().replace(suffixRegex, '');
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
            OLEVOD_setMainRating("N/A", DOUBAN_RATING_API + encodeSpaces(title));
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
            if (obj.length > 0) {
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
    // Remove the annotated suffix of title.
    const suffixRegex = /【.*】$/;
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
        ratingObj.before(`<span class="label"><a href="${url}" target="_blank" style="color:white">豆瓣评分：${ratingNums}</a></span>`);

        // Set MutationObserver for the title element of current page.
        const titleObj = $('.pc-container .info .title');
        const originalText = titleObj.text().trim();
        if (titleObj.length > 0) {
            const observer = new MutationObserver(observerCallback);
            observer.observe(titleObj[0], { subtree: true, characterData: true });

            // Stop watching for mutations before page is unloaded.
            window.onbeforeunload = () => {
                if (observer) {
                    observer.disconnect();
                }
            };

            function observerCallback(mutations, observer) {
                mutations.forEach(function (mutation) {
                    // Check if the character data is changed.
                    if (mutation.type === 'characterData') {
                        const changedText = mutation.target.data.trim();
                        // If the movie page is reloaded by AJAX,
                        // remove the Douban rating of current page and reset for the new page.
                        if (originalText !== changedText) {
                            let ratingObj = $('.pc-container .info .label:first-child');
                            if (/豆瓣/.test(ratingObj.text().trim())) {
                                ratingObj.remove();
                            }
                            observer.disconnect();
                            OLEVOD_setRating();
                        }
                    }
                });
            }
        }
    } else if (OLEVOD_isPlayPage()) {
        let ratingObj = $('#pane-first .tab-label .wes');
        const clone = ratingObj.clone();
        clone.children().remove();
        const originalText = clone.text().trim();
        const array = originalText.split(/ +/);
        if (array.length === 2) {
            const revisedHTML = `${array[0]} <a href="${url}" target="_blank" style="color:#798499">豆瓣${ratingNums}</a>/${array[1]}`;
            ratingObj.html(revisedHTML);
        }

    }
}

function OLEVOD_isDetailPage() {
    return /.+\/details-\d{1}-\d{5}\.html/.test(location.href);
}

function OLEVOD_isPlayPage() {
    return /.+\/player\/vod\/\d{1}-\d{5}-\d{1}\.html/.test(location.href);
}

// ==VQQ==
function VQQ_setRating() {
    const id = VQQ_getID();
    const title = VQQ_getTitle();
    getDoubanRating(`vqq_${id}`, title)
        .then(data => {
            VQQ_setMainRating(data.ratingNums, data.url);
        })
        .catch(err => {
            VQQ_setMainRating("N/A", DOUBAN_RATING_API + encodeSpaces(title));
        });
}

function VQQ_getID() {
    const id = /x\/cover\/(\S+)\//.exec(location.href);
    return id ? id[1] : 0;
}

function VQQ_getTitle() {
    // Remove the annotated suffix of title.
    const suffixRegex = /\[.*\]$/;
    const title = $('span.playlist-intro__title');
    return title.text().trim().replace(suffixRegex, '');
}

function VQQ_setMainRating(ratingNums, url) {
    let ratingObj = $('span.playlist-intro__title');
    ratingObj.after(`<a href="${url}" target="_blank" style="vertical-align:middle; margin-right:6px; color:rgba(255,255,255,0.600)">豆瓣${ratingNums}</a>`);
}

// ==IQIYI==
async function IQIYI_setRating() {
    const id = IQIYI_getID();
    let title = '';
    try {
        title = await IQIYI_waitForTitle(1000, 10);
    } catch (error) {
        logger.error(`IQIYI_waitForTitle: id=${id} error=${error}`);
        return;
    }
    getDoubanRating(`iqiyi_${id}`, title)
        .then(data => {
            IQIYI_setMainRating(data.ratingNums, data.url);
        })
        .catch(err => {
            IQIYI_setMainRating("N/A", DOUBAN_RATING_API + encodeSpaces(title));
        });
}

function IQIYI_getID() {
    const id = /v_(\S+).html/.exec(location.href);
    return id ? id[1] : 0;
}

function IQIYI_waitForTitle(delay, iterations) {
    const selector = '.meta_title__IXJ03';
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
            if (obj.length > 0) {
                const title = obj.text().trim();
                if (title !== "") {
                    clearInterval(intervalID);
                    resolve(title);
                }
            }
        }, delay);
    });
}

function IQIYI_setMainRating(ratingNums, url) {
    let count = 0;
    const intervalID = setInterval(() => {
        const obj = $('#doubanRating');
        if (obj.length === 0) {
            count = 0;
            // Set the align-items to center, for the parent div element with flex layout.
            let flexObj = $('.meta_titleContent__cUi2t');
            flexObj.css("align-items", "center");
            // Insert rating div element after title div element.
            let ratingObj = $('.meta_title__IXJ03');
            ratingObj.after(`<div id="doubanRating" style="margin-left:6px"><a href="${url}" target="_blank" style="color:#f939; font-family:IQYHT-Medium">豆瓣${ratingNums}</a></div>`);
        } else {
            count++;
        }
        // If rating div element is not overwritten and removed in 10s, then clear interval.
        if (count === 10) {
            clearInterval(intervalID);
        }
    }, 1000);
}

// ==YOUKU==
function YOUKU_setRating() {
    const id = YOUKU_getID();
    const title = YOUKU_getTitle();
    getDoubanRating(`youku_${id}`, title)
        .then(data => {
            YOUKU_setMainRating(data.ratingNums, data.url);
        })
        .catch(err => {
            YOUKU_setMainRating("N/A", DOUBAN_RATING_API + encodeSpaces(title));
        });
}

function YOUKU_getID() {
    const id = /id_(\S+).html/.exec(location.href);
    return id ? id[1] : 0;
}

function YOUKU_getTitle() {
    const title = $('h3.new-title-name');
    return title.text().trim();
}

function YOUKU_setMainRating(ratingNums, url) {
    let ratingObj = $('.new-title-name-left span:last-child');
    const originalText = ratingObj.text().trim();
    const revisedHTML = `<a href="${url}" target="_blank" style="color:white">豆瓣${ratingNums}</a>·${originalText}`;
    const revisedAttr = `豆瓣${ratingNums}·${originalText}`;
    ratingObj.html(revisedHTML);
    ratingObj.attr('title', revisedAttr);
}

// ==COMMON==
function clearExpiredCache() {
    const t = GM_getValue('clear_time');
    if (!t || !isValidTime(new Date(t), PERIOD_OF_CLEARING_CACHE)) {
        logger.info(`clearExpiredCache: clear_time=${t}`);
        const idList = GM_listValues();
        idList.forEach(function (id) {
            // Delete the expired IDs periodically.
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

    const url = DOUBAN_RATING_API + encodeSpaces(title);
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

function encodeSpaces(text) {
    return text.replace(/ /g, '%20');
}