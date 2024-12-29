import { WRAP_TYPE, REPL_TYPE } from "../contansts.js";
import { t } from "logseq-l10n"
import { getDefaultConfig } from "./defaults.js"
import { getTextOperator } from "../core.jsx"
import { registerCommand } from "../utils.jsx"

export function getConfig(preferredFormat) {
  const userConfig = Object.entries(logseq.settings ?? {})
    .filter(([k, _]) => k.startsWith("wrap-") ||
      k.startsWith("repl-") ||
      k.startsWith("group-"),
    )
    .map(([k, v]) => {
      if (k.startsWith("group-")) {
        return {
          key: k,
          items: Object.entries(v).map(([kk, vv]) => ({ key: kk, ...vv })),
        }
      } else {
        return { key: k, ...v }
      }
    })

  if (userConfig.length > 0) {
    return userConfig
  } else {
    return getDefaultConfig(t, preferredFormat === 'org')
  }
}

function flatConfig(definitions) {
  return definitions.flatMap((definition) => {
    if (definition.key.startsWith("group-")) {
      return flatConfig(definition.items)
    } else {
      return definition
    }
  })
}

function getConfigType(key) {
  if (key.startsWith("wrap-")) {
    return WRAP_TYPE
  } else if (key.startsWith("repl-")) {
    return REPL_TYPE
  } else {
    return null
  }
}

function setTextOperatorByConfig(model, config) {
  model[config.key] = getTextOperator(getConfigType(config.key), config)
}

export function configToModel(configs) {
  const model = {}
  flatConfig(configs).forEach((config) => {
    setTextOperatorByConfig(model, config)
  })
  return model
}

export function registerCommandsByConfig(model, configs) {
  flatConfig(configs).forEach((config) => {
    registerCommand(model[config.key], config)
  })
}