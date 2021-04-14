/**
 * By Alexey Avramenko and Retentioneering Team 
 * Copyright (C) 2020 Maxim Godzi, Anatoly Zaytsev, Retentioneering Team
 * This Source Code Form is subject to the terms of the Retentioneering Software Non-Exclusive, Non-Commercial Use License (License)
 * By using, sharing or editing this code you agree with the License terms and conditions. 
 * You can obtain License text at https://github.com/retentioneering/retentioneering-dom-observer/blob/master/LICENSE.md
 */
/* eslint-disable max-len */
import { assert } from "chai"
import sinon from "sinon"
import {
    DomObserver,
    ObserveDomEvent,
    FoundEvent,
    MutatedEvent,
    FOUND_EVENT_NAME,
    MUTATED_EVENT_NAME,
} from "./DomObserver"

describe("DomObserver", () => {
    beforeEach(() => {
        clearJSDOM()
        setupJSDOM(`
            <html>
                <head>
                <title>Test DOM observer</title>
                </head>
                <body>
                    <div id="app"></div>
                </body>
            </html>
        `)
    })

    const observerConfig = {
        attributes: false,
        childList: true,
        subtree: true,
        characterData: false,
        characterDataOldValue: false,
        attributeOldValue: false,
    }

    const randomInteger = (n: number) => Math.floor(Math.random() * n) + 1

    const findAppOrFail = () => {
        const app = document.body.querySelector<Element>("#app")
        if (!app) {
            return assert.fail("invalid dom")
        }
        return app
    }

    const appendElement = (
        parent: Element,
        tagName: string,
        id?: string
    ) => {
        const el = document.createElement(tagName)
        if (id) {
            el.setAttribute("id", id)
        }
        parent.appendChild(el)
        return el
    }

    const WAIT_TIMEOUT_MS = 200

    it("observe existing element", done => {
        const app = findAppOrFail()
        const domObserver = new DomObserver().start()
        domObserver.observe({
            name: "appContainer",
            selector: "#app",
            observerConfig,
        })
        domObserver.subscribe(() => done())
        appendElement(app, "div")
    })

    it("observe dynamically injected element", done => {
        const app = findAppOrFail()
        const domObserver = new DomObserver().start()
        domObserver.observe({
            name: "targetElement",
            selector: "#target",
            observerConfig,
        })
        domObserver.subscribe(e => {
            assert(e.type === FOUND_EVENT_NAME, `unexpected event ${e.type}`)
            done()
        })
        appendElement(app, "div", "target")
    })

    it("unsubscribe", done => {
        const app = findAppOrFail()
        const domObserver = new DomObserver().start()
        domObserver.observe({
            name: "appContainer",
            selector: "#app",
            observerConfig,
        })
        const cb = sinon.fake()
        const unsubscribe = domObserver.subscribe(cb)
        unsubscribe()
        appendElement(app, "div")
        setTimeout(() => {
            assert(!cb.called, "unexpected subscribe cb call")
            done()
        }, WAIT_TIMEOUT_MS)
    })

    it("stop observation", done => {
        const app = findAppOrFail()
        const domObserver = new DomObserver().start()
        domObserver.observe({
            name: "appContainer",
            selector: "#app",
            observerConfig,
        })
        const cb = sinon.fake()
        domObserver.subscribe(cb)
        domObserver.stopObservation("appContainer")
        assert(domObserver.observed.length === 0)
        appendElement(app, "div")
        setTimeout(() => {
            assert(!cb.called, "unexpected subscribe cb call")
            done()
        }, WAIT_TIMEOUT_MS)
    })

    it("clear removed nodes", (done) => {
        const app = findAppOrFail()
        const domObserver = new DomObserver()
        domObserver.observe({
            name: "targetElement",
            selector: "#target",
            observerConfig,
        })
        let targetElementRemoved = false
        domObserver.start(() => {
            if (targetElementRemoved) {
                assert(domObserver.observed.length === 0)
                done()
            } else {
                assert(domObserver.observed.length === 1)
            }
        })
        const child = appendElement(app, "div", "target")
        setTimeout(() => {
            app.removeChild(child)
            targetElementRemoved = true
        }, 100)
    })

    it("observe multiple targets", done => {
        const app = findAppOrFail()
        const domObserver = new DomObserver().start()
        const foundEvents: ObserveDomEvent[] = []
        const mutations: MutationRecord[] = []
        domObserver.subscribe(e => {
            if (e.type === FOUND_EVENT_NAME) {
                foundEvents.push(e)
            }
            if (e.type === MUTATED_EVENT_NAME) {
                mutations.push(...e.mutations)
            }
        })

        const targetsCount = randomInteger(20)
        const mutationsCount = randomInteger(10)

        for (let i = 1; i <= targetsCount; i++) {
            const targetId = `target${i}`
            const target = appendElement(app, "div", targetId)
            domObserver.observe({
                name: targetId,
                selector: `#${targetId}`,
                observerConfig,
            })

            for (let j = 1; j <= mutationsCount; j++) {
                appendElement(target, "div")
            }
        }
        setTimeout(() => {
            assert(foundEvents.length === targetsCount)
            assert(mutations.length >= mutationsCount * targetsCount)
            done()
        }, WAIT_TIMEOUT_MS)
    })

    it("multiple observer on same element", (done) => {
        const app = findAppOrFail()
        const domObserver = new DomObserver().start()
        let foundEventsCount = 0
        let mutateEventsCount = 0
        const observersLog: string[] = []

        const cb = sinon.fake()
        domObserver.subscribe(({ descriptor, type }) => {
            if (type === FOUND_EVENT_NAME) {
                foundEventsCount += 1
            }
            if (type === MUTATED_EVENT_NAME) {
                mutateEventsCount += 1
            }
            observersLog.push(descriptor.name)
            cb()
        })

        domObserver.observe({
            name: "appContainer1",
            selector: "#app",
            observerConfig,
        })
        domObserver.observe({
            name: "appContainer2",
            selector: "#app",
            observerConfig,
        })
        appendElement(app, "div")
        setTimeout(() => {
            assert(cb.callCount === 4)
            assert(foundEventsCount === 2)
            assert(mutateEventsCount === 2)
            assert(observersLog.includes("appContainer1"))
            assert(observersLog.includes("appContainer2"))
            done()
        }, WAIT_TIMEOUT_MS)

    })

    it("check target element on mutated event", (done) => {
        const app = findAppOrFail()
        const domObserver = new DomObserver().start()

        const foundEvents: FoundEvent[] = []
        const mutatedEvents: MutatedEvent[] = []

        domObserver.subscribe((e) => {
            if (e.type === FOUND_EVENT_NAME) {
                foundEvents.push(e)
            }
            if (e.type === MUTATED_EVENT_NAME) {
                mutatedEvents.push(e)
            }

            if (foundEvents.length && mutatedEvents.length) {
                assert(foundEvents.length === 1)
                assert(foundEvents[0].element === app)
                assert(mutatedEvents.length === 1)
                assert(mutatedEvents[0].element === app)
                done()
            }
        })
        domObserver.observe({
            name: "appContainer",
            selector: "#app",
            observerConfig,
        })
        appendElement(app, "div")
    })
})
