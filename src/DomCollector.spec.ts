/**
 * By Alexey Avramenko and Retentioneering Team 
 * Copyright (C) 2020 Maxim Godzi, Anatoly Zaytsev, Retentioneering Team
 * This Source Code Form is subject to the terms of the Retentioneering Software Non-Exclusive, Non-Commercial Use License (License)
 * By using, sharing or editing this code you agree with the License terms and conditions. 
 * You can obtain License text at https://github.com/retentioneering/retentioneering-dom-observer/blob/master/LICENSE.md
 */
/* eslint-disable max-len */
import { assert, expect } from "chai"
import sinon from "sinon"
import { ParserConfig, ParseDomResult } from "./DomParser"
import { createDomCollector, DomCollectorTarget } from "./DomCollector"

describe("DomCollector", () => {
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


    const findAppOrFail = () => {
        const app = document.body.querySelector<Element>("#app")
        if (!app) {
            return assert.fail("invalid dom")
        }
        return app
    }

    const createElementWithHTML = (tagName: string, html: string) => {
        const div = document.createElement(tagName)
        div.innerHTML = html
        return div
    }

    const createCart = () => {
        const cartHTMLStr = `
        <div id ="cart" class="cart">
          <div class="order-title">Order #1</div>
          <div class="total">
              Total: <span>23400</span>
          </div>
        </div>
      `
        const cart = createElementWithHTML("div", cartHTMLStr)
        if (!cart) {
            return assert.fail("invalid dom")
        }
        const app = findAppOrFail()
        app.appendChild(cart)
    }

    const addItemToCart = (name: string, price: string, discount: string) => {
        const cart = document.querySelector("#cart")
        const item = createElementWithHTML(
            "div",
            `
          <div class="item">
            <div class="item-title">
                <h1>${name}</h1>
                <div class="price">
                    <div class="default-price">${price}</div>
                    <div class="discount-price">${discount}</div>
                </div>
            </div>
          </div>
        `
        )
        cart?.appendChild(item)
    }

    const parseConfig: ParserConfig = {
        type: "object",
        keys: [
            {
                key: "cart",
                value: {
                    type: "object",
                    keys: [
                        {
                            key: "order",
                            value: {
                                type: "string",
                                selector: ".order-title",
                            },
                        },
                        {
                            key: "total",
                            value: {
                                type: "string",
                                selector: ".total span",
                            },
                        },
                        {
                            key: "items",
                            value: {
                                type: "array",
                                selector: ".item",
                                items: {
                                    type: "object",
                                    keys: [
                                        {
                                            key: "name",
                                            value: {
                                                type: "string",
                                                selector: ".item-title h1",
                                            },
                                        },
                                        {
                                            key: "price",
                                            value: {
                                                type: "string",
                                                selector:
                                                    ".price .default-price",
                                            },
                                        },
                                        {
                                            key: "discount",
                                            value: {
                                                type: "string",
                                                selector:
                                                    ".price .discount-price",
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
            },
        ],
    }

    const WAIT_TIMEOUT_MS = 100

    // TODO make test more abstract and split cases
    it("collect mutable dom", done => {
        const target: DomCollectorTarget = {
            name: "cart",
            targetSelector: "#cart",
            guardSelector: ".item",
            parseRootEl: "#cart",
            parseConfig,
        }
        const collectResults: ParseDomResult[] = []
        const onCollect = sinon.spy(({ name, parsedContent }) => {
            assert(name === "cart")
            collectResults.push(parsedContent)
        })
        const mainObserverCallback = sinon.fake()
        createDomCollector({
            targets: [target],
            rootEl: document.body,
            onCollect,
            mainObserverCallback,
        })
        createCart()
        addItemToCart("Motherboard", "4000", "3400")
        setTimeout(() => {
            expect(collectResults[0]).to.be.deep.equal({
                cart: {
                    order: "Order #1",
                    total: "23400",
                    items: [
                        {
                            name: "Motherboard",
                            price: "4000",
                            discount: "3400",
                        },
                    ],
                },
            })
            addItemToCart("Graphics card", "20000", "20000")
            setTimeout(() => {
                assert(onCollect.called)
                assert(mainObserverCallback.called)
                expect(collectResults[collectResults.length -1]).to.be.deep.equal({
                    cart: {
                        order: "Order #1",
                        total: "23400",
                        items: [
                            {
                                name: "Motherboard",
                                price: "4000",
                                discount: "3400",
                            },
                            {
                                name: "Graphics card",
                                price: "20000",
                                discount: "20000",
                            },
                        ],
                    },
                })
                done()
            }, WAIT_TIMEOUT_MS)
        }, 100)
    })

    it("map result", (done) => {
        const target: DomCollectorTarget = {
            name: "cart",
            targetSelector: "#cart",
            guardSelector: ".item",
            parseRootEl: "#cart",
            parseConfig,
            mapResult: (result) => {
                expect(result).to.be.deep.equal({
                    cart: {
                        order: "Order #1",
                        total: "23400",
                        items: [
                            {
                                name: "Motherboard",
                                price: "4000",
                                discount: "3400",
                            },
                        ],
                    },
                })

                return {
                    itemsCount: result.cart.items.length,
                }
            },
        }
        // TODO: костыль. Разобраться почему вызывается
        let doneCalled = false
        const onCollect = sinon.spy(({ name, parsedContent }) => {
            assert(name === "cart")
            expect(parsedContent).to.be.deep.equal({
                itemsCount: 1,
            })
            if (!doneCalled) done()
            doneCalled = true
        })
        const mainObserverCallback = sinon.fake()
        createDomCollector({
            targets: [target],
            rootEl: document.body,
            onCollect,
            mainObserverCallback,
        })
        createCart()
        addItemToCart("Motherboard", "4000", "3400")
    })
})
