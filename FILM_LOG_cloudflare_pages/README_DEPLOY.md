# FILM LOG — GitHub + Cloudflare Pages 部署包

这是从 WorkBuddy 导出的 FILM LOG V1 项目整理出的纯静态部署包。

## 目录

- `index.html`：网站入口
- `app.js`：页面逻辑与观影数据
- `styles.css` / `enhance.css`：样式
- `enhance.js`：视觉增强
- `medals.js` / `stats.js`：功能脚本
- `build.json`：当前版本号
- `assets/`：图片资源
- `_headers`：Cloudflare Pages 缓存策略

## GitHub

把本目录内的所有文件上传到 GitHub 仓库根目录即可。

不要再套一层 `FILM_LOG_cloudflare_pages/` 文件夹。

## Cloudflare Pages

创建 Pages 项目并连接 GitHub 仓库：

- Framework preset：None / 无
- Build command：留空
- Build output directory：`/`

这是纯静态网站，不需要 Node、npm 或数据库。

## 更新网站

目前观影数据直接保存在 `app.js` 的 `seed()` / `FILM_DB` 中。

修改数据后：
1. 修改 `app.js`
2. 更新 `build.json` 中的 build 数字
3. 同时把 `index.html` 中 `__EXPECTED_BUILD__`、CSS/JS 的 `?v=` 参数更新为相同数字
4. 提交 GitHub
5. Cloudflare Pages 自动重新部署

建议每次发布使用新的时间戳 BUILD，例如：`20260921153000`。

## 注意

`localStorage` 中的内容属于浏览器本地数据，不会同步到其他设备。
如果未来希望“管理员在手机上新增观影记录后，所有人立即看到”，需要再增加云端数据存储/API；当前版本不需要数据库也可以正常作为公开静态网站运行。
