function e(t,s){if("string"===t.type){const e=(s||window.document).querySelector(t.selector);return e?e.textContent:null}if("number"===t.type){const e=(s||window.document).querySelector(t.selector),r=e?e.textContent:null;return t.formatter(r,e)}if("boolean"===t.type){const e=(s||window.document).querySelector(t.selector);return Boolean(e)}if("array"===t.type){const s=document.querySelectorAll(t.selector);if(t.items){const r=[];for(const n of s)r.push(e(t.items,n));return r}return[...s].map(e=>e.textContent)}if("object"===t.type){const r={};for(const{key:n,value:o}of t.keys)r[n]=e(o,s);return r}return null}class t{constructor(){this.events=[]}createUnwatcher(e,t){return()=>{for(let e=0;e<this.events.length;e++){const s=this.events[e];s.handlers=s.handlers.filter(e=>e!==t),s.handlers.length||(this.events.splice(e,1),e--)}}}on(e,t){const s=this.createUnwatcher(e,t),r=this.events.find(t=>t.eventName===e);return r&&r.handlers.includes(t)||(r?r.handlers.push(t):this.events.push({eventName:e,handlers:[t]})),s}off(e,t){this.createUnwatcher(e,t)()}dispatch(e,t){const s=this.events.find(t=>t.eventName===e);if(s)for(const e of s.handlers)e(t)}}const s={attributes:!1,childList:!0,subtree:!0,characterData:!1,characterDataOldValue:!1,attributeOldValue:!1},r="target-element-found",n="target-element-mutated";class o extends t{constructor(e=document.body){super(),this._rootElement=e,this._mainObserver=null,this._observedElements=[],this._targetElementsObservers=[],this._targetElementsDescriptors=[],this._onRootElementMutated=e=>{for(const t of e)if("childList"===t.type){for(const s of t.addedNodes)if(s instanceof window.HTMLElement)for(const t of this._targetElementsDescriptors)this._checkTargetSelectorAndObserve(t,s,e);this._clearObservedElementsByMutation(t)}}}_checkTargetSelectorAndObserve(e,t,s){const r=t.matches(e.selector)?[t]:[...t.querySelectorAll(e.selector)];if(!r.length)return;this._observeTargetElements(r,e);const n=this._matchTargetElementMutations(e,s);n.length&&this._dispatchMutatedEvent(n,e)}_matchTargetElementMutations(e,t){const s=[];for(const r of t)r.target.closest(e.selector)&&s.push(r);return s}_observeTargetElements(e,t){const s=new window.MutationObserver(e=>this._onTargetElementMutated(e,t));for(const r of e){if(this._observedElements.includes(r))continue;this._observedElements.push(r);r.innerHTML;this._dispatchFoundEvent(t,r),s.observe(r,t.observerConfig)}const r=this._targetElementsObservers.find(e=>e.descriptor.name===t.name);r?r.observers.push(s):this._targetElementsObservers.push({descriptor:t,observers:[s]})}_onTargetElementMutated(e,t){this._dispatchMutatedEvent(e,t)}_dispatchMutatedEvent(e,t){const s={type:"target-element-mutated",descriptor:t,mutations:e};this.dispatch("target-element-mutated",s)}_dispatchFoundEvent(e,t){const s={type:"target-element-found",descriptor:e,element:t};this.dispatch("target-element-found",s)}_clearObservedElementsByMutation(e){this._observedElements=this._observedElements.filter(t=>![...e.removedNodes].includes(t))}_clearObservedElementsByDescriptor(e){this._observedElements=this._observedElements.filter(t=>!t.matches(e.selector))}get observedElements(){return[...this._observedElements]}start(e){return this._mainObserver=new window.MutationObserver(t=>{this._onRootElementMutated(t),e&&e(t)}),this._mainObserver.observe(this._rootElement,s),this}stop(){return this._mainObserver&&(this._mainObserver.disconnect(),this._onRootElementMutated(this._mainObserver.takeRecords()),this._mainObserver=null),this.stopObservation(),this}subscribe(e,t){const s=s=>{t?t.name===s.descriptor.name&&e(s):e(s)};return this.on("target-element-mutated",s),this.on("target-element-found",s),()=>{this.off("target-element-mutated",s),this.off("target-element-found",s)}}stopObservation(e){for(let t=0;t<this._targetElementsObservers.length;t++){const s=this._targetElementsObservers[t];if(!e||s.descriptor.name===e){this._clearObservedElementsByDescriptor(s.descriptor);for(const e of s.observers){const t=e.takeRecords();t.length&&this._onTargetElementMutated(t,s.descriptor),e.disconnect()}this._targetElementsObservers.splice(t,1),t--}}if(!e)return this._targetElementsDescriptors=[],this;const t=this._targetElementsDescriptors.filter(t=>t.name!==e);return this._targetElementsDescriptors=t,this}observe(e){this._targetElementsDescriptors.push(e);const t=[...this._rootElement.querySelectorAll(e.selector)];return t.length&&this._observeTargetElements(t,e),this}}const i={attributes:!1,childList:!0,subtree:!0,characterData:!1,characterDataOldValue:!1,attributeOldValue:!1},a=({targets:t,onCollect:s,rootEl:r,mainObserverCallback:n})=>{const a=new o(r||document.body);a.start(n);for(const r of t){const t={name:r.name,selector:r.targetSelector,observerConfig:r.observeConfig||i};a.subscribe(t=>{const{guardSelector:n}=r;if(!n||document.querySelector(n)){const t="string"==typeof r.parseRootEl?document.querySelector(r.parseRootEl):r.parseRootEl;if(!t)return;const n=e(r.parseConfig,t);s({name:r.name,parsedContent:n})}},t),a.observe(t)}return a};export{o as DomObserver,t as EventEmitter,r as FOUND_EVENT_NAME,n as MUTATED_EVENT_NAME,a as createDomCollector,e as parseDOM};
//# sourceMappingURL=dom-observer.es.js.map
