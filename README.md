中文 | [English](README.en.md)

# logseq-plugin-wrap

创建自定义文字包围/替换及快捷键，默认提供了一组实用的配置。

## 使用展示

![demo](./demo.gif)

## 用户配置

![open_settings](./open_settings.png)

通过 Logseq 插件设置面板配置，或直接编辑 `settings.json`。

### 工具条设置

| 键 | 类型 | 默认值 | 说明 |
|----|------|--------|------|
| `toolbar` | boolean | `true` | 选中文字时显示格式化工具条 |
| `toolbarShortcut` | string | `""` | 切换工具条显示的快捷键 |

### 自定义规则（`customRules`）

规则以 JSON 数组形式配置在 `settings.json` 的 `customRules` 键下。共有三种规则类型：`wrap`、`repl` 和 `group`。

**包围规则（wrap）** — 用模板包围选中文字，`$^` 代表选中的文字。

**替换规则（repl）** — 对选中文字进行正则替换。

**分组规则（group）** — 将多个规则合并为工具条上的一个下拉按钮。

**规则字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| `type` | 是 | `"wrap"`、`"repl"` 或 `"group"` |
| `key` | 是 | 唯一标识符，用于命令注册 |
| `label` | 是 | 命令面板中显示的名称 |
| `binding` | 否 | 键盘快捷键（如 `"mod+shift+b"`） |
| `template` | wrap 专用 | 包围模板，`$^` 替换为选中文字 |
| `regex` | repl 专用 | 匹配用的正则表达式 |
| `replacement` | repl 专用 | 替换字符串（支持捕获组 `$1`、`$2` 等） |
| `items` | group 专用 | `wrap` 或 `repl` 规则数组 |
| `icon` | 否 | 工具条中显示的 SVG 字符串 |

若 `customRules` 为空或未设置，插件将使用内置默认规则。

## 自定义工具栏样式

请参看下方示例：

```css
/* 工具栏的背景色 */
:root {
  --kef-wrap-tb-bg: #333e;
}
:root.dark {
  --kef-wrap-tb-bg: #777e;
}

/* 这里更改工具栏本身的样式 */
#kef-wrap-toolbar {
  background: #333;
}

/* 这里是工具栏上按钮的样式 */
.kef-wrap-tb-item {
}

/* 这里是工具栏上按钮在有鼠标悬浮时的样式 */
.kef-wrap-tb-item:hover {
  filter: drop-shadow(0 0 3px #fff);
}

/* 这里可以定义svg图标的样式 */
.kef-wrap-tb-item img {
  width: 20px;
  height: 20px;
}
```

内置高亮与文字色的样式如下：

```css
mark {
  background: #fef3ac !important;
  color: #262626 !important;
}
span[data-ref="#red"],
span[data-ref="#green"],
span[data-ref="#blue"],
span[data-ref="$red"],
span[data-ref="$green"],
span[data-ref="$blue"] {
  display: none;
}
span[data-ref="#red"] + mark {
  background: #ffc7c7 !important;
  color: #262626 !important;
}
span[data-ref="#green"] + mark {
  background: #ccffc1 !important;
  color: #262626 !important;
}
span[data-ref="#blue"] + mark {
  background: #abdfff !important;
  color: #262626 !important;
}
span[data-ref="$red"] + mark {
  color: #f00 !important;
  background: unset !important;
  padding: 0;
  border-radius: 0;
}
span[data-ref="$green"] + mark {
  color: #0f0 !important;
  background: unset !important;
  padding: 0;
  border-radius: 0;
}
span[data-ref="$blue"] + mark {
  color: #00f !important;
  background: unset !important;
  padding: 0;
  border-radius: 0;
}
```

## 关于内置的去除格式化

出于技术原因，嵌套的格式不会被去除干净，这种情况下你可以尝试多次去除。
