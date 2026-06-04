[中文](README.md) | English

# logseq-plugin-wrap

Create your own wrappings/replacements with optional key bindings for selected text. A set of useful defaults is also provided.

## Usage

![demo](./demo.gif)

## User configs

![open_settings](./open_settings.png)

Configure the plugin via Logseq's plugin settings panel, or edit `settings.json` directly.

### Toolbar settings

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `toolbar` | boolean | `true` | Show the formatting toolbar when text is selected |
| `toolbarShortcut` | string | `""` | Shortcut to toggle toolbar visibility |

### Custom rules (`customRules`)

Rules are configured as a JSON array under the `customRules` key in `settings.json`. There are three rule types: `wrap`, `repl`, and `group`.

**Wrap rule** — wraps selected text with a template. `$^` represents the selected text.

**Replace rule** — applies a regex replacement to selected text.

**Group rule** — groups multiple rules into a single toolbar button with a dropdown.

**Rule fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | `"wrap"`, `"repl"`, or `"group"` |
| `key` | yes | Unique identifier used for command registration |
| `label` | yes | Human-readable name shown in command palette |
| `binding` | no | Keyboard shortcut (e.g. `"mod+shift+b"`) |
| `template` | wrap only | Wrap template, `$^` is replaced with selected text |
| `regex` | repl only | Regular expression to match |
| `replacement` | repl only | Replacement string (supports capture groups `$1`, `$2`, ...) |
| `items` | group only | Array of `wrap` or `repl` rules |
| `icon` | no | SVG string shown in toolbar |

If `customRules` is empty or not set, the plugin uses its built-in default rules.

## Toolbar style customization

Please refer to the following example:

```css
/* Toolbar's background color */
:root {
  --kef-wrap-tb-bg: #333e;
}
:root.dark {
  --kef-wrap-tb-bg: #777e;
}

/* Here goes styles for the toolbar itself */
#kef-wrap-toolbar {
  background: #333;
}

/* Here goes styles for toolbar buttons */
.kef-wrap-tb-item {
}

/* Here goes styles for toolbar buttons when hovered */
.kef-wrap-tb-item:hover {
  filter: drop-shadow(0 0 3px #fff);
}

/* Here you can define styles for the svg icon */
.kef-wrap-tb-item img {
  width: 20px;
  height: 20px;
}
```

Builtin styles for highlight and text color is as follows:

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

## About builtin "Remove formatting"

Due to technical reason, nested formatting is not cleared completely, you can try to perform multiple removings in this case.
