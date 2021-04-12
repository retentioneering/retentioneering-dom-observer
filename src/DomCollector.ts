/**
 * By Alexey Avramenko and Retentioneering Team 
 * Copyright (C) 2020 Maxim Godzi, Anatoly Zaytsev, Retentioneering Team
 * This Source Code Form is subject to the terms of the Retentioneering Software Non-Exclusive, Non-Commercial Use License (License)
 * By using, sharing or editing this code you agree with the License terms and conditions. 
 * You can obtain License text at https://github.com/retentioneering/retentioneering-dom-observer/blob/master/LICENSE.md
 */
import { DomObserver, MainObserverCb } from "./DomObserver"
import { parseDOM, ParserConfig, ParseDomResult } from "./DomParser"

export type DomCollectorTarget = {
    name: string
    targetSelector: string
    guardSelector?: string
    childGuardSelector?: string
    guard?: (rootElement: HTMLElement) => boolean
    parseRootEl: string | HTMLElement
    observeConfig?: MutationObserverInit
    parseConfig: ParserConfig
    payload?: any
    mapResult?: (parsedContent: any) => any
}

type DomCollectorResult = {
    name: string
    payload?: any
    parsedContent: any
}

type Params = {
    targets: DomCollectorTarget[]
    onCollect: (result: DomCollectorResult) => void
    rootEl?: HTMLElement
    mainObserverCallback?: MainObserverCb
}

const DEFAULT_OBSERVER_CONFIG = {
    attributes: false,
    childList: true,
    subtree: true,
    characterData: false,
    characterDataOldValue: false,
    attributeOldValue: false,
}

export const createDomCollector = ({
    targets,
    onCollect,
    rootEl,
    mainObserverCallback,
}: Params) => {
    const domObserver = new DomObserver(rootEl || document.body)
    
    domObserver.start(mainObserverCallback)
    
    for (const target of targets) {
        const { mapResult } = target

        const observeDescriptor = {
            name: target.name,
            selector: target.targetSelector,
            observerConfig: target.observeConfig || DEFAULT_OBSERVER_CONFIG,
        }
        domObserver.subscribe((e) => {
            const { guardSelector, childGuardSelector, guard } = target
            if (!guardSelector || document.querySelector(guardSelector)) {
                const parseRootEl =
                    typeof target.parseRootEl === "string"
                        ? document.querySelector<HTMLElement>(
                            target.parseRootEl
                        )
                        : target.parseRootEl
                if (!parseRootEl) {
                    return
                }

                if (childGuardSelector 
                    && !parseRootEl.querySelector(childGuardSelector)) {
                    return
                }

                if (guard && !guard(parseRootEl)) {
                    return
                }

                const parsedContent = parseDOM(target.parseConfig, parseRootEl)
                onCollect({
                    name: target.name,
                    payload: target.payload,
                    parsedContent: mapResult
                        ? mapResult(parsedContent)
                        : parsedContent,
                })
            }
        }, observeDescriptor)
        domObserver.observe(observeDescriptor)
    }

    return domObserver
}
