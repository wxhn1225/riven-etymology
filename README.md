# 紫卡词根

Warframe 紫卡（Riven Mod）名字里的每个前缀和后缀：来自哪个词，为什么是这个词。

页面有简体中文（默认）和英文两种语言，右上角按钮切换，也可以直接用 `index.html?lang=en`。

## 打开

直接双击 `index.html`（需要联网加载 Google 字体），或者打开 GitHub Pages 上的版本。

- **总览**：顶部是目录，点属性名直接进入那一页的讲解；下面是所有词根的卡片，可以搜索，点卡片也能进入讲解。
- **讲解**：点「开始讲解」，一屏一个属性，适合录屏。
  - `←` `→`（或空格）翻页，`Home` / `End` 跳到首尾
  - `M` 或右上角「目录」打开目录，点属性名跳过去
  - `F` 全屏，`H` 隐藏翻页按钮和提示，`Esc` 回总览
  - 地址栏 `index.html#讲解/acri-tis` 可以直接打开某一页

## 数据

内容都在 `data/affixes.json`，每一项是一个属性：

| 字段 | 含义 |
|---|---|
| `id` | 前缀-后缀，也用于 `#讲解/<id>` |
| `zh` / `en` | 属性名 |
| `status` | `active` 在用；`dedicated` 有专用词根但名字上显示别的（见 `shownAs`）；`reserved` 预留；`removed` 已删除 |
| `whole` | 前缀和后缀是否取自同一个词 |
| `prefix` / `suffix` | `frag` 片段、`cut` 剪字标记、`word` 来源词、`lang` 语言（页面上显示成来源词上方的小标签，所以 `why` 不再以语言名开头）、`gloss` 意思、`why` 为什么是这个词、`rating` 可信度、`links` 出处、`alts` 其他候选来源 |
| `alts` | 同一半的其他候选，每项有 `word`、`lang`、`gloss`、`why`、`links`，`cut` 可选；页面上显示成「也可能」一行 |
| `whyEn` / `labelEn` | 英文版：每个 `why` 都要有对应的 `whyEn`；链接名里有中文的，要有 `labelEn` |

`cut` 的写法：`[...]` 前缀保留的字母，`{...}` 后缀保留的字母，`(+i)` 前缀补上的元音，其余是删去的字母。例如 `[ācri]tā{tis}`。

`rating`：`3` 整词对上，`2` 词根对上，`1` 可能，`g` 猜想，`0` 未知。页面上 `1` / `g` 盖「存疑」章，`0` 盖「未知」章。

改完 JSON 后：

```bash
python tools/validate.py
python tools/build.py
```

第一条检查剪字标记（包括 `alts` 里的）是否真的拼得出片段，以及英文字段是否齐全；第二条生成页面用的 `data/affixes.js`。

网页运行只需要 `index.html`、`assets/` 和 `data/affixes.js`。
