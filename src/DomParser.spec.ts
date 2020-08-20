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

    it("parse number", () => {
        clearJSDOM()
        setupJSDOM(`
            <div class="b-reviews-offer-block">
                <span>
                    <div class="b-reviews-offer-block__rate">
                        <a href="/catalog/phone/224/5722400/comments#mainContent">
                            <div class="rating-universal-svg">
                                <img src="https://cdn.svyaznoy.ru/upload/web/svyaznoy/img/product-block/rate_gray_small.svg" alt="">
                                        <span itemprop="ratingValue" content="7"></span><span itemprop="worstRating" content="0"></span><span itemprop="bestRating" content="10"></span>
                                    <div class="rating-universal-svg__empty"></div>
                                <div class="rating-universal-svg__fill _rate7"></div>
                            </div>
                        </a>
                    </div>
                    <a href="/catalog/phone/224/5722400/comments#mainContent" class="b-reviews-offer-block__link">Отзывы&nbsp; <span>9</span></a>
                        <br class="dich">
                    <a href="/catalog/phone/224/5722400/faq#mainContent" class="b-reviews-offer-block__link _ques-answ">Вопросы&nbsp;и&nbsp;ответы&nbsp;<span>16/16</span></a>
                </span>
            </div>
        `)
        const result = parseDOM({            
            type: "object",
            keys: [
                {
                    key: "reviews",
                    value: {
                        type: "number",
                        selector: ".b-reviews-offer-block .b-reviews-offer-block__link span",
                        formatter: (v) => {
                            if (v) {
                                if (/\d+$/.test(v)) {
                                    return Number(v)
                                }
                            }
                            return null
                        },
                    },
                },
                {
                    key: "rating",
                    value: {
                        type: "number",
                        selector: ".b-reviews-offer-block .rating-universal-svg__fill",
                        formatter: (v, el) => {
                            if (el) {
                                for (const className of el.classList) {
                                    if (/_rate\d+$/.test(className)) {
                                        const mathed = className.match(/\d+/)
                                        if (mathed && mathed[0]) {
                                            return Number(mathed[0]) * 10
                                        }
                                    }
                                }
                                return null
                            }
                            return null
                        }
                    },
                },
            ],
        })
        expect(result).to.be.deep.equal({
            reviews: 9,
            rating: 70
        })
    })

    it("parse count of elements", () => {
        clearJSDOM()
        setupJSDOM(`
            <ul>
                <li>1</li>
                <li>2</li>
                <li>3</li>
                <li>4</li>
            </ul>
        `)

        const result = parseDOM({
            type: "count",
            selector: "ul li"
        })
        expect(result).equal(4)
    })

    it("parse count in array", () => {
        clearJSDOM()
        setupJSDOM(`
            <div>
                <div class="list">
                    <ul>
                        <li>1</li>
                        <li>2</li>
                        <li>3</li>
                        <li>4</li>
                    </ul>
                </div>
                <div class="list">
                    <ul>
                        <li>1</li>
                        <li>2</li>
                        <li>3</li>
                    </ul>
                </div>
            </div>
        `)

        const result = parseDOM({
            type: "array",
            selector: ".list",
            items: {
                type: "count",
                selector: "ul li"
            },
        })
        console.log(result)
        expect(result).to.be.deep.equal([4,3])
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
