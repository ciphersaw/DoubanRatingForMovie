# DoubanRatingForMovie

[![release](https://img.shields.io/github/v/release/ciphersaw/DoubanRatingForMovie)](https://github.com/ciphersaw/DoubanRatingForMovie) [![jquery](https://img.shields.io/badge/jquery-3.6.0-blue)](https://jquery.com/)

English | [简体中文](README-zh_CN.md)

DoubanRatingForMovie is a userscript based on [Tampermonkey](https://www.tampermonkey.net/) extension for popular browsers. It works in online movie websites and displays Douban rating for movies.

## Features

- Display Douban rating in movie detail and play pages.
- Link to detail page of Douban rating.
- Cache rating data for reducing query frequency.
	- The term of valid cache is set to one day by default.
	- The period of clearing expired cache is set to one day by default.

## Supported Website List

| Name                                                         | URL                        | Status |
| ------------------------------------------------------------ | -------------------------- | ------ |
| <img src="https://v.qq.com/favicon.ico" width="33" height="30" align=center/>Tencent Video | https://v.qq.com/          | ✅      |
| <img src="https://www.iqiyi.com/favicon.ico" width="33" height="28" align=center/>iQIYI | https://www.iqiyi.com/     | ✅      |
| <img src="https://img.alicdn.com/imgextra/i2/O1CN01BeAcgL1ywY0G5nSn8_!!6000000006643-2-tps-195-195.png" width="34" height="29" align=center/>Youku | https://youku.com/         | ✅      |
| <img src="https://i0.hdslb.com/bfs/static/jinkela/long/images/favicon.ico" width="30" height="25" align=center/>bilibili | https://www.bilibili.com/  | ✅      |
| <img src="https://www.miguvideo.com/favicon.ico" width="30" height="25" align=center/>Migu Video | https://www.miguvideo.com/ | ✅      |
| <img src="https://www.olevod.com/favicon.ico" width="31" height="25" align=center/>Olevod (New Version) | https://www.olevod.com/    | ✅      |
| <img src="https://www.olevod.com/favicon.ico" width="31" height="25" align=center/>Olevod (Old Version) | https://www.olehdtv.com/   | ✅      |

## Screenshots

### [Tencent Video](https://v.qq.com/)

Display Douban rating in movie play page:

![vqq-play-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/vqq-play-page.png)

### [iQIYI](https://www.iqiyi.com/)

Display Douban rating in movie play page:

![iqiyi-play-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/iqiyi-play-page.png)

### [Youku](https://youku.com/)

Display Douban rating in movie play page:

![youku-play-page-v2](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/youku-play-page-v2.png)

### [bilibili](https://www.bilibili.com/)

Display Douban rating in movie play page:

![bilibili-play-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/bilibili-play-page.png)

### [Migu Video](https://www.miguvideo.com/)

Display Douban rating in movie play page:

![bilibili-play-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/migu-play-page.png)

### [Olevod (New Version)](https://www.olevod.com/)

Display Douban rating in movie detail page:

![olevod-detail-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/olevod-detail-page.png)

Display Douban rating in movie play page:

![olevod-play-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/olevod-play-page.png)

### [Olevod (Old Version)](https://www.olehdtv.com/)

Display Douban rating in movie detail page:

![olehdtv-detail-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/olehdtv-detail-page.png)

Display Douban rating in movie play page:

![olehdtv-play-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/olehdtv-play-page.png)
