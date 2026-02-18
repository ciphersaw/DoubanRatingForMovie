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
	- Support manual clearing of cached data.

## Supported Website List

| Name                                                         | URL                        | Status |
| ------------------------------------------------------------ | -------------------------- | ------ |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/vqq-favicon.png" width="16" height="16" align=center/> Tencent Video | https://v.qq.com/          | ✅      |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/iqiyi-favicon.png" width="16" height="16" align=center/> iQIYI | https://www.iqiyi.com/     | ✅      |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/youku-favicon.png" width="16" height="16" align=center/> Youku | https://youku.com/         | ✅      |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/bilibili-favicon.png" width="16" height="16" align=center/> bilibili | https://www.bilibili.com/  | ✅      |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/migu-favicon.png" width="16" height="16" align=center/> Migu Video | https://www.miguvideo.com/ | ✅      |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/iyf-favicon.png" width="16" height="16" align=center/> AIYIFAN | https://www.iyf.tv/ | ✅      |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/olevod-favicon.png" width="16" height="16" align=center/> Olevod (New Version) | https://www.olevod.com/    | ✅      |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/olehdtv-favicon.png" width="16" height="16" align=center/> Olevod (Old Version) | https://www.olehdtv.com/   | ✅      |

## Screenshots

### [Tencent Video](https://v.qq.com/)

Display Douban rating in movie play page:

![vqq-play-page-v2](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/vqq-play-page-v2.png)

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

![migu-play-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/migu-play-page.png)

### [AIYIFAN](https://www.iyf.tv/)

Display Douban rating in movie play page:

![iyf-play-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/iyf-play-page.png)

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
