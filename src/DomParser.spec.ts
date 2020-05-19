/**
 * By Alexey Avramenko and Retentioneering Team 
 * Copyright (C) 2020 Maxim Godzi, Anatoly Zaytsev, Retentioneering Team
 * This Source Code Form is subject to the terms of the Retentioneering Software Non-Exclusive, Non-Commercial Use License (License)
 * By using, sharing or editing this code you agree with the License terms and conditions. 
 * You can obtain License text at https://github.com/retentioneering/retentioneering-dom-observer/blob/master/LICENSE.md
 */
/* eslint-disable max-len */
import { assert, expect } from "chai"
import { parseDOM } from "./DomParser"

describe("DomParser", () => {
    beforeEach(() => {
        clearJSDOM()
        setupJSDOM(`
            <html>
                <head>
                <title>Test DOM parser</title>
                </head>
                <body>
                    <div class="cart">
                        <div class="order-title">Order #1</div>
                        <div class="hot">Hot!</div>
                        <div class="item">
                            <div class="item-title">
                                <h1>Motherboard</h1>
                                <div class="price">
                                    <div class="default-price">4000</div>
                                    <div class="discount-price">3400</div>
                                    <div class="not-available">not available</div>
                                </div>
                            </div>
                        </div>
                        <div class="item">
                            <div class="item-title">
                                <h1>Graphics card</h1>
                                <div class="price">
                                    <div class="default-price">20000</div>
                                    <div class="discount-price">20000</div>
                                </div>
                            </div>
                        </div>
                        <div class="total">
                            Total: <span>23400</span>
                        </div>
                    </div>
                </body>
            </html>
        `)
    })

    it("parse simple string", () => {
        const result = parseDOM({
            type: "string",
            selector: ".order-title",
        })
        assert(result === "Order #1")
    })

    it("parse structure", () => {
        const result = parseDOM({
            type: "object",
            keys: [
                {
                    key: "cart",
                    value: {
                        type: "object",
                        keys: [
                            {
                                key: "hot",
                                value: {
                                    type: "boolean",
                                    selector: ".hot",
                                },
                            },
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
                                                key: "not_available",
                                                value: {
                                                    type: "boolean",
                                                    selector: ".not-available",
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
        })
        expect(result).to.be.deep.equal({
            cart: {
                order: "Order #1",
                hot: true,
                total: "23400",
                items: [
                    {
                        name: "Motherboard",
                        price: "4000",
                        discount: "3400",
                        not_available: true,
                    },
                    {
                        name: "Graphics card",
                        price: "20000",
                        discount: "20000",
                        not_available: false,
                    },
                ],
            },
        })
    })
})
