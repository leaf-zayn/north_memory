# 北境 · 冬日旅行绘本

从雪落的哈尔滨，到林海列车，再到漠河星空。

这是一个艺术化的 2.5D 互动绘本，不是真实地图、三维实景重建或具体交通行程。
场景由 AI 创作；极光为艺术想象，不构成观测保证。

## 浏览

向下滚动切换场景，或点击底部章节。可打开旅途手记、暂停动态。
回忆页为未来照片和文字留有扩展点，本版没有上传或保存功能。

## 部署

本仓库为纯静态站点。GitHub Pages 使用 `main` 分支根目录。
保留 `.nojekyll`，以及 `assets/`、`vendor/` 的原有相对路径。

本地可用任意静态 HTTP 服务器预览，例如：

```sh
python3 -m http.server 8080
```

检查 JavaScript：

```sh
node --check app.js
node --check chapters.js
```

## 素材

三张原创 AI 场景图附有生成提示词元数据。
字体使用 Noto Serif SC 和 Noto Sans SC，许可为 SIL Open Font License 1.1，
完整许可保留于 `vendor/`。
