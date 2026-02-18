# DoubanRatingForMovie

[![release](https://img.shields.io/github/v/release/ciphersaw/DoubanRatingForMovie)](https://github.com/ciphersaw/DoubanRatingForMovie) [![jquery](https://img.shields.io/badge/jquery-3.6.0-blue)](https://jquery.com/)

[English](README.md) | 简体中文

DoubanRatingForMovie 是一个应用于[篡改猴](https://www.tampermonkey.net/)扩展插件的用户脚本，用于在常见的视频网站上展示豆瓣评分，支持在通用浏览器中使用。

## 功能

- 在电影详情及播放页面内，展示豆瓣评分。
- 点击链接可跳转至豆瓣评分详情页面。
- 缓存豆瓣评分数据，以减少查询频率。
	- 评分数据缓存有效期，默认为一天。
	- 过期缓存数据清理周期，默认为一天。
	- 支持手动清空缓存数据。

## 已支持的网站列表

| 名称                                                         | 网址                       | 状态 |
| ------------------------------------------------------------ | -------------------------- | ---- |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/vqq-favicon.png" width="16" height="16" align=center/> 腾讯视频 | https://v.qq.com/          | ✅    |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/iqiyi-favicon.png" width="16" height="16" align=center/> 爱奇艺 | https://www.iqiyi.com/     | ✅    |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/youku-favicon.png" width="16" height="16" align=center/> 优酷 | https://youku.com/         | ✅    |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/bilibili-favicon.png" width="16" height="16" align=center/> 哔哩哔哩 | https://www.bilibili.com/  | ✅    |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/migu-favicon.png" width="16" height="16" align=center/> 咪咕视频 | https://www.miguvideo.com/ | ✅    |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/iyf-favicon.png" width="16" height="16" align=center/> 爱壹帆 | https://www.iyf.tv/ | ✅    |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/olevod-favicon.png" width="16" height="16" align=center/> 欧乐影院（新版） | https://www.olevod.com/    | ✅    |
| <img src="https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/olehdtv-favicon.png" width="16" height="16" align=center/> 欧乐影院（旧版） | https://www.olehdtv.com/   | ✅    |

## 效果截图

### [腾讯视频](https://v.qq.com/)

在电影播放页面展示豆瓣评分：

![vqq-play-page-v2](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/vqq-play-page-v2.png)

### [爱奇艺](https://www.iqiyi.com/)

在电影播放页面展示豆瓣评分：

![iqiyi-play-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/iqiyi-play-page.png)

### [优酷](https://youku.com/)

在电影播放页面展示豆瓣评分：

![youku-play-page-v2](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/youku-play-page-v2.png)

### [哔哩哔哩](https://www.bilibili.com/)

在电影播放页面展示豆瓣评分：

![bilibili-play-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/bilibili-play-page.png)

### [咪咕视频](https://www.miguvideo.com/)

在电影播放页面展示豆瓣评分：

![migu-play-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/migu-play-page.png)

### [爱壹帆](https://www.iyf.tv/)

在电影播放页面展示豆瓣评分：

![iyf-play-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/iyf-play-page.png)

### [欧乐影院（新版）](https://www.olevod.com/)

在电影详情页面展示豆瓣评分：

![olevod-detail-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/olevod-detail-page.png)

在电影播放页面展示豆瓣评分：

![olevod-play-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/olevod-play-page.png)

### [欧乐影院（旧版）](https://www.olehdtv.com/)

在电影详情页面展示豆瓣评分：

![olehdtv-detail-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/olehdtv-detail-page.png)

在电影播放页面展示豆瓣评分：

![olehdtv-play-page](https://blog-1255335783.cos.ap-guangzhou.myqcloud.com/DoubanRatingForMovie/README/olehdtv-play-page.png)
