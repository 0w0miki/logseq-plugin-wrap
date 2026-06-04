import { t } from "logseq-l10n"
import { getDefaultConfig } from "./defaults.js"
import { getTextOperator } from "../core.jsx"
import { registerCommand } from "../utils.jsx"

export function getConfig(preferredFormat) {
  const customRules = logseq.settings?.customRules
  if (Array.isArray(customRules) && customRules.length > 0) {
    return customRules
  }
  return getDefaultConfig(t, preferredFormat === 'org')
}

function flatConfig(definitions) {
  return definitions.flatMap((definition) => {
    if (definition.type === "group") {
      return flatConfig(definition.items ?? [])
    }
    return definition
  })
}

function setTextOperatorByConfig(model, config) {
  const op = getTextOperator(config.type, config)
  if (op != null) {
    model[config.key] = op
  }
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
