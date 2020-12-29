/**
 * By Alexey Avramenko and Retentioneering Team 
 * Copyright (C) 2020 Maxim Godzi, Anatoly Zaytsev, Retentioneering Team
 * This Source Code Form is subject to the terms of the Retentioneering Software Non-Exclusive, Non-Commercial Use License (License)
 * By using, sharing or editing this code you agree with the License terms and conditions. 
 * You can obtain License text at https://github.com/retentioneering/retentioneering-dom-observer/blob/master/LICENSE.md
 */
type ParseTarget = "textContent" | string

type ParserConfigObject = {
    type: "object"
    keys: {
        key: string
        value: ParserConfig
    }[]
}

type ParserConfigArray = {
    type: "array"
    selector: string
    parseFrom?: ParseTarget
    items?: ParserConfig
}

type ParserConfigString = {
    type: "string"
    selector?: string
    parseFrom?: ParseTarget
    formatter?: (value: string | null, el: HTMLElement | null) => any
}

type ParseConfigBoolean = {
    type: "boolean"
    selector: string
    inverse?: boolean
}

type ParseConfigCount = {
    type: "count"
    selector: string
}

type ParseConfigNumber = {
    type: "number"
    selector?: string
    parseFrom?: ParseTarget
    formatter: (
        value: string | null, el: HTMLElement | Document | null
    ) => number | null
}

export type ParserConfig =
    | ParserConfigObject
    | ParserConfigArray
    | ParserConfigString
    | ParseConfigBoolean
    | ParseConfigNumber
    | ParseConfigCount

export type ParseDomResult =
    | string
    | null
    | boolean
    | number
    | Array<ParseDomResult>
    | {
        [key: string]: ParseDomResult
    }


const parseText = (
    el: HTMLElement | Document,
    parseFrom?: ParseTarget
) => {
    if (!parseFrom || (parseFrom === "textContent")) {
        return el.textContent
    }
    if (typeof parseFrom === "string" && el instanceof HTMLElement) {
        return el.getAttribute(parseFrom)
    }
    return null
}

/**
 * Parse a specific structure from the DOM recursively
 * @param  config - configuration object that describes the type of the resulting object and how to get it from the DOM
 * @param  rootElement - root DOM element. will be parsed inside the children of this element
 * @return result of parsing
 */
export function parseDOM(
    config: ParserConfig,
    rootElement?: HTMLElement
): ParseDomResult {
    if (config.type === "string") {
        const parentElement = rootElement || window.document
        if (!config.selector) {
            return parseText(parentElement, config.parseFrom)
        }
        const targetElement = parentElement.querySelector<HTMLElement>(
            config.selector
        )
        const value =  targetElement
            ? parseText(targetElement, config.parseFrom)
            : null
        return config.formatter ? config.formatter(value, targetElement) : value
    }
    if (config.type === "count") {
        const parentElement = rootElement || window.document
        const targetElements = parentElement.querySelectorAll<HTMLElement>(
            config.selector
        )
        return targetElements.length
    }
    if (config.type === "number") {
        const parentElement = rootElement || window.document
        if (!config.selector) {
            const value = parseText(parentElement, config.parseFrom)
            return config.formatter(value, parentElement)
        }
        const targetElement = parentElement.querySelector<HTMLElement>(
            config.selector
        )
        const value = targetElement
            ? parseText(targetElement, config.parseFrom) : null
        return config.formatter(value, targetElement)
    }

    if (config.type === "boolean") {
        const parentElement = rootElement || window.document
        const targetElement = parentElement.querySelector<HTMLElement>(
            config.selector
        )
        const targetElementExists = Boolean(targetElement)
        return !config.inverse ? targetElementExists : !targetElementExists
    }
    if (config.type === "array") {
        const parentElement = rootElement || window.document
        const mathedElems = parentElement.querySelectorAll<HTMLElement>(
            config.selector
        )
        if (config.items) {
            const values = [] as ParseDomResult[]
            for (const el of mathedElems) {
                values.push(parseDOM(config.items, el))
            }
            return values
        } else {
            return [...mathedElems].map(
                (el: HTMLElement) => parseText(el, config.parseFrom)
            )
        }
    }
    if (config.type === "object") {
        const result = {} as { [key: string]: ParseDomResult }
        for (const { key, value } of config.keys) {
            result[key] = parseDOM(value, rootElement)
        }
        return result
    }
    return null
}
