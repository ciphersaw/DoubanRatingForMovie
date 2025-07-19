// ==UserScript==
// @name         DoubanRatingForMovie
// @name:zh-CN   在线电影添加豆瓣评分
// @namespace    https://github.com/ciphersaw/DoubanRatingForMovie
// @version      1.3.1
// @description  Display Douban rating for online movies such as Tencent Video, iQIYI, Youku, bilibili, Migu Video, Olevod and so on.
// @description:zh-CN  在腾讯视频、爱奇艺、优酷、哔哩哔哩、咪咕视频、欧乐影院等主流电影网站上显示豆瓣评分。
// @author       CipherSaw
// @match        *://*.olehdtv.com/index.php*
// @match        *://*.olevod.com/details*
// @match        *://*.olevod.com/player/vod/*
// @match        *://*.olevod.tv/details*
// @match        *://*.olevod.tv/player/vod/*
// @match        *://v.qq.com/x/cover/*
// @match        *://www.iqiyi.com/v_*
// @match        *://v.youku.com/v_show/*
// @match        *://www.bilibili.com/bangumi/play/*
// @match        *://www.miguvideo.com/p/detail/*
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
    } else if (host === 'www.bilibili.com') {
        BILIBILI_setRating();
    } else if (host === 'www.miguvideo.com') {
        MIGU_setRating();
    }
})();

// ==OLEHDTV==
function OLEHDTV_setRating() {
    const id = OLEHDTV_getID();
    const title = OLEHDTV_getTitle();
    const director = OLEHDTV_getDirector();
    const year = OLEHDTV_getYear();
    getDoubanRating(`olehdtv_${id}`, title, director, year)
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

function OLEHDTV_getDirector() {
    let selector = '';
    if (OLEHDTV_isDetailPage()) {
        selector = '.content_min li.data:last';
    } else if (OLEHDTV_isPlayPage()) {
        selector = '.play_content p:first-child';
    }
    const directorText = $(selector).text().trim();
    const directors = /^导演：(.+)$/.exec(directorText);
    if (directors) {
        const array = directors[1].split(/\s+/);
        return array[0];
    } else {
        return '';
    }
}

function OLEHDTV_getYear() {
    let selector = '';
    if (OLEHDTV_isDetailPage()) {
        selector = 'ul li.data:first-child';
    } else if (OLEHDTV_isPlayPage()) {
        selector = '.play_text a';
    }
    const yearText = $(selector).text().trim();
    const year = /\d{4}/.exec(yearText);
    return year ? year[0] : '';
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
    // Note that director and year must be selected after OLEVOD_waitForTitle,
    // which means elements have been already loaded and do not need to wait again.
    const director = OLEVOD_getDirector();
    const year = OLEVOD_getYear();
    getDoubanRating(`olevod_${id}`, title, director, year)
        .then(data => {
            OLEVOD_setMainRating(data.ratingNums, data.url);
        })
        .catch(err => {
            OLEVOD_setMainRating("N/A", DOUBAN_RATING_API + encodeSpaces(title));
        });
}

function OLEVOD_getID() {
    const id = /\d{1,2}-\d{4,5}/.exec(location.href);
    return id ? id[0] : 0;
}

function OLEVOD_waitForTitle(delay, iterations) {
    let selector = '';
    if (OLEVOD_isDetailPage()) {
        selector = ".pc-container .info .title";
    } else if (OLEVOD_isPlayPage()) {
        selector = ".el-tabs__content .tab-label";
    }
    return waitForElement(selector, delay, iterations, obj => OLEVOD_resolveTitle(obj));
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

function OLEVOD_getDirector() {
    if (OLEVOD_isDetailPage()) {
        const directorText = $('.pc-container .info p:nth-of-type(2)').text().trim();
        const directors = /^导演：(.+)$/.exec(directorText);
        if (directors) {
            const array = directors[1].split(/\s*\/\s*/);
            return array[0];
        } else {
            return '';
        }
    } else if (OLEVOD_isPlayPage()) {
        // Director is not found in the movie play page.
        return '';
    }
}

function OLEVOD_getYear() {
    let selector = '';
    if (OLEVOD_isDetailPage()) {
        selector = '.pc-container .info .label';
    } else if (OLEVOD_isPlayPage()) {
        selector = '.el-tabs__content .tab-label p.wes';
    }
    const yearText = $(selector).text().trim();
    const year = /\d{4}/.exec(yearText);
    return year ? year[0] : '';
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
    return /.+\/details-\d{1,2}-\d{4,5}\.html/.test(location.href);
}

function OLEVOD_isPlayPage() {
    return /.+\/player\/vod\/\d{1,2}-\d{4,5}-\d+\.html/.test(location.href);
}

// ==VQQ==
function VQQ_setRating() {
    const id = VQQ_getID();
    const title = VQQ_getTitle();
    // It is hard to get director in VQQ, so set them to null temporarily.
    const director = '';
    const year = VQQ_getYear();
    getDoubanRating(`vqq_${id}`, title, director, year)
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
    const title = $('h1.playlist-intro__title');
    return title.text().trim().replace(suffixRegex, '');
}

function VQQ_getYear() {
    const yearText = $('span.playlist-intro-info__item').text();
    const year = /\S*· (\d{4}) ·\S*/.exec(yearText);
    return year ? year[1] : '';
}

function VQQ_setMainRating(ratingNums, url) {
    let ratingObj = $('h1.playlist-intro__title');
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
    // It is hard to get director and year in IQIYI, so set them to null temporarily.
    const director = '';
    const year = '';
    getDoubanRating(`iqiyi_${id}`, title, director, year)
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
    const selector = '.meta_titleNotCloud__O2Ffr';
    return waitForElement(selector, delay, iterations, obj => obj.text().trim());
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
            let ratingObj = $('.meta_titleNotCloud__O2Ffr');
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
    // It is hard to get director and year in YOUKU, so set them to null temporarily.
    const director = '';
    const year = '';
    getDoubanRating(`youku_${id}`, title, director, year)
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
    const title = $('.title');
    return title.text().trim();
}

function YOUKU_setMainRating(ratingNums, url) {
    let ratingObj = $('div.title');
    ratingObj.after(`<a href="${url}" target="_blank" style="vertical-align:middle; margin-left:12px; color:rgba(255,255,255,0.400)">豆瓣${ratingNums}</a>`);
}

// ==BILIBILI==
function BILIBILI_setRating() {
    const id = BILIBILI_getID();
    const title = BILIBILI_getTitle();
    // It is hard to get director in BILIBILI, so set them to null temporarily.
    const director = '';
    const year = BILIBILI_getYear();
    getDoubanRating(`bilibili_${id}`, title, director, year)
        .then(data => {
            BILIBILI_setMainRating(data.ratingNums, data.url);
        })
        .catch(err => {
            BILIBILI_setMainRating("N/A", DOUBAN_RATING_API + encodeSpaces(title));
        });
}

function BILIBILI_getID() {
    const id = /bangumi\/play\/(\w+)/.exec(location.href);
    return id ? id[1] : 0;
}

function BILIBILI_getTitle() {
    const title = $('.mediainfo_mediaTitle__Zyiqh');
    return title.text().trim();
}

function BILIBILI_getYear() {
    const yearText = $('.mediainfo_mediaRight__SDOq4 .mediainfo_mediaDesc__jjRiB:eq(1)').text().trim();
    const year = /(^|\S*· )(\d{4})(年| ·\S*)/.exec(yearText);
    return year ? year[2] : '';
}

function BILIBILI_setMainRating(ratingNums, url) {
    let ratingObj = $('.mediainfo_mediaRating__C5uvV');
    if (ratingObj.length > 0) {
        const mediaRatingDiv = $(`<div class="mediainfo_mediaRating__C5uvV"></div>`);
        const mediaScoreDiv = $(`<div class="mediainfo_score__SQ_KG"></div>`);
        const ratingLink = $(`<a href="${url}" target="_blank">${ratingNums}</a>`);
        const ratiTextDiv = $(`<div class="mediainfo_ratingText__N8GtM">豆瓣评分</div>`);
        mediaScoreDiv.append(ratingLink);
        // Add span element only for the rating number.
        if (ratingNums !== '暂无评分' && ratingNums !== 'N/A') {
            mediaScoreDiv.append(`<span class="mediainfo_suffix__fXV4_">分</span>`);
        }
        // Combine all elements.
        mediaRatingDiv.append(mediaScoreDiv).append(ratiTextDiv);
        ratingObj.after(mediaRatingDiv);
    } else {
        ratingObj = $('.mediainfo_mediaRight__SDOq4 .mediainfo_mediaDesc__jjRiB:eq(0)');
        const originalText = ratingObj.text().trim();
        const revisedHTML = `<a href="${url}" target="_blank">豆瓣${ratingNums}</a> · ${originalText}`;
        ratingObj.html(revisedHTML);
    }
}

// ==MIGU==
async function MIGU_setRating() {
    const id = MIGU_getID();
    let title = '';
    try {
        title = await MIGU_waitForTitle(1000, 10);
    } catch (error) {
        logger.error(`MIGU_waitForTitle: id=${id} error=${error}`);
        return;
    }
    let director = '';
    try {
        director = await MIGU_waitForDirector(1000, 10);
    } catch (error) {
        logger.error(`MIGU_waitForDirector: id=${id} error=${error}`);
        return;
    }
    let year = '';
    try {
        year = await MIGU_waitForYear(1000, 10);
    } catch (error) {
        logger.error(`MIGU_waitForYear: id=${id} error=${error}`);
        return;
    }
    getDoubanRating(`migu_${id}`, title, director, year)
        .then(data => {
            MIGU_setMainRating(data.ratingNums, data.url);
        })
        .catch(err => {
            MIGU_setMainRating("N/A", DOUBAN_RATING_API + encodeSpaces(title));
        });
}

function MIGU_getID() {
    const id = /p\/detail\/(\d+)/.exec(location.href);
    return id ? id[1] : 0;
}

function MIGU_waitForTitle(delay, iterations) {
    const selector = '.episodeTitle';
    return waitForElement(selector, delay, iterations, obj => {
        const suffixRegex = /（.*）$/;
        return obj.text().trim().replace(suffixRegex, '');
    });
}

function MIGU_waitForDirector(delay, iterations) {
    const selector = '.program_info .tag:first-child';
    return waitForElement(selector, delay, iterations, obj => {
        const directorText = obj.text().trim();
        const directors = /^导演：\s*(.+)$/.exec(directorText);
        return directors ? directors[1] : '';
    });
}

function MIGU_waitForYear(delay, iterations) {
    const selector = '.video_tags';
    return waitForElement(selector, delay, iterations, obj => {
        const yearText = obj.text().trim();
        const year = /(\d{4})/.exec(yearText);
        return year ? year[1] : '';
    });
}

function MIGU_setMainRating(ratingNums, url) {
    let ratingObj = $('.video_tags');
    ratingObj.append(`<a data-v-1de0f319 href="${url}" target="_blank">豆瓣评分：${ratingNums}</a>`);
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

function waitForElement(selector, delay = 1000, iterations = 10, resolveFn) {
    return new Promise((resolve, reject) => {
        let count = 0;
        const interval = setInterval(() => {
            const element = $(selector);
            if (element.length > 0) {
                let result = resolveFn(element);
                if (result !== "") {
                    clearInterval(interval);
                    resolve(result);
                }
            } else if (++count >= iterations) {
                clearInterval(interval);
                reject(new Error(`ResolveError: element ${selector} not found after ${iterations} attempts`));
            }
        }, delay);
    });
}

async function getDoubanRating(key, title, director, year) {
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
                        let data = resolveDoubanRatingResult(url, director, year, response);
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

function resolveDoubanRatingResult(searchURL, director, year, data) {
    const s = getDoubanRatingItem(director, year, data);
    if (s === null) {
        throw Error("ResolveError: search result is not found");
    }
    const ratingNums = s.find('.rating_nums').text() || '暂无评分';
    const doubanLink = s.find('.content .title a').attr('href') || '';
    let url = resolveDoubanURL(doubanLink);
    if (url === "") {
        url = searchURL;
    }
    const ratingData = {
        ratingNums,
        url
    }
    return ratingData;
}

function getDoubanRatingItem(director, year, data) {
    let item = null;
    if (director === '' && year === '') {
        item = data.find('.result-list .result:first-child');
    } else {
        const list = data.find('.result-list').children();
        list.each(function () {
            const info = $(this).find('.subject-cast').text();
            const array = info.split(/\s*\/\s*/); // e.g. ['原名:毕业那年', '姚宇', '顾莉雅', '2012']
            if (array.length > 0 && array[0].includes('原名')) {
                array.shift();
            }
            let releaseYear = null;
            if (/^\d{4}$/.test(array[array.length - 1])) {
                releaseYear = array.pop();
            }
            if (director !== '' && array.indexOf(director) === -1) {
                return true;
            }
            if (year !== '' && releaseYear !== year) {
                return true;
            }
            item = $(this);
            return false;
        });
        if (item === null) {
            item = data.find('.result-list .result:first-child');
        }
    }
    return item;
}

function resolveDoubanURL(doubanLink) {
    try {
        return (new URL(doubanLink)).searchParams.get('url');
    } catch (error) {
        logger.error(`resolveDoubanURL: error=${error.message}`);
        return "";
    }
}

function encodeSpaces(text) {
    return text.replace(/ /g, '%20');
}