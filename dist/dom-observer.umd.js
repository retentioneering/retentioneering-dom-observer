!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e=e||self).RetentioneeringDomObserver={})}(this,(function(e){"use strict";const t=(e,t)=>t&&"textContent"!==t?"string"==typeof t&&e instanceof Element?e.getAttribute(t):null:e.textContent;function r(e,s){if("string"===e.type){const r=s||window.document;if(!e.selector)return t(r,e.parseFrom);const n=r.querySelector(e.selector),o=n?t(n,e.parseFrom):null;return e.formatter?e.formatter(o,n):o}if("count"===e.type){return(s||window.document).querySelectorAll(e.selector).length}if("number"===e.type){const r=s||window.document;if(!e.selector){const s=t(r,e.parseFrom);return e.formatter(s,r)}const n=r.querySelector(e.selector),o=n?t(n,e.parseFrom):null;return e.formatter(o,n)}if("boolean"===e.type){const t=(s||window.document).querySelector(e.selector),r=Boolean(t);return e.inverse?!r:r}if("array"===e.type){const n=(s||window.document).querySelectorAll(e.selector);if(e.items){const t=[];for(const s of n)t.push(r(e.items,s));return t}return[...n].map(r=>t(r,e.parseFrom))}if("object"===e.type){const t={};for(const{key:n,value:o}of e.keys)t[n]=r(o,s);return t}return null}class s{constructor(){this.events=[]}createUnwatcher(e,t){return()=>{for(let e=0;e<this.events.length;e++){const r=this.events[e];r.handlers=r.handlers.filter(e=>e!==t),r.handlers.length||(this.events.splice(e,1),e--)}}}on(e,t){const r=this.createUnwatcher(e,t),s=this.events.find(t=>t.eventName===e);return s&&s.handlers.includes(t)||(s?s.handlers.push(t):this.events.push({eventName:e,handlers:[t]})),r}off(e,t){this.createUnwatcher(e,t)()}dispatch(e,t){const r=this.events.find(t=>t.eventName===e);if(r)for(const e of r.handlers)e(t)}}const n={attributes:!1,childList:!0,subtree:!0,characterData:!1,characterDataOldValue:!1,attributeOldValue:!1};class o extends s{constructor(e=document.body){super(),this._rootElement=e,this._mainObserver=null,this._targetElementsObservers=[],this._targetElementsDescriptors=[],this._onRootElementMutated=e=>{for(const t of e)if("childList"===t.type){for(const r of t.addedNodes)if(r instanceof window.Element)for(const t of this._targetElementsDescriptors)this._checkTargetSelectorAndObserve(t,r,e);this._clearObservedElementsByMutation(t)}}}_checkTargetSelectorAndObserve(e,t,r){const s=[...t.querySelectorAll(e.selector)];if(t.matches(e.selector)&&s.push(t),!s.length)return;this._observeTargetElements(s,e);const n=this._matchTargetElementMutations(e,r);for(const{target:t,mutations:r}of n)this._dispatchMutatedEvent(t,r,e)}_matchTargetElementMutations(e,t){const r=[];for(const s of t){if(!(s.target instanceof Element))continue;const t=s.target.closest(e.selector);if(!t)continue;const n=r.find(e=>e.target===t);n?n.mutations.push(s):r.push({target:t,mutations:[s]})}return r}_observeTargetElements(e,t){const r=this._targetElementsObservers.find(e=>e.descriptor===t),s=r||{descriptor:t,observedElements:[]};r||this._targetElementsObservers.push(s);for(const r of e){if(s.observedElements.some(({element:e})=>e===r))continue;const e=new window.MutationObserver(e=>this._onTargetElementMutated(r,e,t));this._dispatchFoundEvent(t,r),e.observe(r,t.observerConfig),s.observedElements.push({element:r,observer:e})}}_onTargetElementMutated(e,t,r){this._dispatchMutatedEvent(e,t,r)}_dispatchMutatedEvent(e,t,r){const s={type:"target-element-mutated",descriptor:r,mutations:t,element:e};this.dispatch("target-element-mutated",s)}_dispatchFoundEvent(e,t){const r={type:"target-element-found",descriptor:e,element:t};this.dispatch("target-element-found",r)}_clearObservedElementsByMutation(e){if(e.removedNodes&&e.removedNodes.length){for(const{descriptor:t,observedElements:r}of this._targetElementsObservers)for(let s=0;s<r.length;s++){const{element:n,observer:o}=r[s];if([...e.removedNodes].includes(n)){const e=o.takeRecords();e.length&&this._onTargetElementMutated(n,e,t),o.disconnect(),r.splice(s,1),s--}}for(let e=0;e<this._targetElementsObservers.length;e++){this._targetElementsObservers[e].observedElements.length||(this._targetElementsObservers.splice(e,1),e--)}}}_clearObservedElementsByDescriptor(e){const t=this._targetElementsObservers.findIndex(t=>t.descriptor===e);if(-1===t)return;const{observedElements:r}=this._targetElementsObservers[t];for(let t=0;t<r.length;t++){const{element:s,observer:n}=r[t],o=n.takeRecords();o.length&&this._onTargetElementMutated(s,o,e),n.disconnect(),r.splice(t,1),t--}}get observed(){return this._targetElementsObservers}start(e){return this._mainObserver=new window.MutationObserver(t=>{this._onRootElementMutated(t),e&&e(t)}),this._mainObserver.observe(this._rootElement,n),this}stop(){return this._mainObserver&&(this._mainObserver.disconnect(),this._onRootElementMutated(this._mainObserver.takeRecords()),this._mainObserver=null),this.stopObservation(),this}subscribe(e,t){const r=r=>{t?t.name===r.descriptor.name&&e(r):e(r)};return this.on("target-element-mutated",r),this.on("target-element-found",r),()=>{this.off("target-element-mutated",r),this.off("target-element-found",r)}}stopObservation(e){for(let t=0;t<this._targetElementsObservers.length;t++){const r=this._targetElementsObservers[t];e&&r.descriptor.name!==e||(this._clearObservedElementsByDescriptor(r.descriptor),this._targetElementsObservers.splice(t,1),t--)}if(!e)return this._targetElementsDescriptors=[],this;const t=this._targetElementsDescriptors.filter(t=>t.name!==e);return this._targetElementsDescriptors=t,this}observe(e){this._targetElementsDescriptors.push(e);const t=[...this._rootElement.querySelectorAll(e.selector)];return t.length&&this._observeTargetElements(t,e),this}}const i={attributes:!1,childList:!0,subtree:!0,characterData:!1,characterDataOldValue:!1,attributeOldValue:!1};e.DomObserver=o,e.EventEmitter=s,e.FOUND_EVENT_NAME="target-element-found",e.MUTATED_EVENT_NAME="target-element-mutated",e.createDomCollector=({targets:e,onCollect:t,rootEl:s,mainObserverCallback:n})=>{const a=new o(s||document.body);a.start(n);for(const s of e){const{mapResult:e}=s,n={name:s.name,selector:s.targetSelector,observerConfig:s.observeConfig||i};a.subscribe(n=>{const{element:o}=n,{guardSelector:i,childGuardSelector:a,guard:l}=s;if(!i||document.querySelector(i)){let n;if(n=s.parseRootEl?"string"==typeof s.parseRootEl?document.querySelector(s.parseRootEl):s.parseRootEl:o,!n)return;if(a&&!n.querySelector(a))return;if(l&&!l(n))return;const i=r(s.parseConfig,n);t({name:s.name,payload:s.payload,parsedContent:e?e(i):i})}},n),a.observe(n)}return a},e.parseDOM=r,Object.defineProperty(e,"__esModule",{value:!0})}));
//# sourceMappingURL=dom-observer.umd.js.map
