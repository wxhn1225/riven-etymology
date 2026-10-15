# 紫卡词根

Warframe 紫卡（Riven Mod）名字里的每个前缀和后缀，以及它们来自哪个词。

网站：https://wxhn1225.github.io/riven-etymology/

## 本地预览

页面通过 `fetch` 读取数据，需要用本地服务器打开：

```bash
python -m http.server 8000
```

然后访问 http://localhost:8000 。

## 数据

所有内容都在 `data/affixes.json`，每一项是一个属性：

| 字段 | 含义 |
|---|---|
| `id` | 前缀-后缀，也用作网页锚点，例如 `#acri-tis` |
| `zh` / `en` | 属性名 |
| `active` | 当前是否会出现在紫卡名字上 |
| `whole` | 前缀和后缀是否取自同一个词 |
| `prefix` / `suffix` | `frag` 片段、`cut` 剪字标记、`word` 来源词、`lang` 语言、`gloss` 意思、`rating` 可信度、`links` 出处 |
| `game` | 可选，游戏里的对应说法 |

`cut` 的写法：`[...]` 是前缀保留的字母，`{...}` 是后缀保留的字母，`(+i)` 是前缀补上的元音，其余是删去的字母。例如 `[ācri]tā{tis}` 表示 Acri 和 tis 都取自 ācritātis。

`rating`：`3` 整词对上，`2` 词根对上，`1` 可能，`g` 猜想，`0` 未知。网页上 `1` 和 `g` 显示为「存疑」，`0` 显示为「未知」。

改完数据后运行校验，它会检查剪字标记是否真的拼得出片段：

```bash
python tools/validate.py
```
