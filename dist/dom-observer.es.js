const e=(e,t)=>t&&"textContent"!==t?"string"==typeof t&&e instanceof Element?e.getAttribute(t):null:e.textContent;function t(r,s){if("string"===r.type){const t=s||window.document;if(!r.selector)return e(t,r.parseFrom);const n=t.querySelector(r.selector),o=n?e(n,r.parseFrom):null;return r.formatter?r.formatter(o,n):o}if("count"===r.type){return(s||window.document).querySelectorAll(r.selector).length}if("number"===r.type){const t=s||window.document;if(!r.selector){const s=e(t,r.parseFrom);return r.formatter(s,t)}const n=t.querySelector(r.selector),o=n?e(n,r.parseFrom):null;return r.formatter(o,n)}if("boolean"===r.type){const e=(s||window.document).querySelector(r.selector),t=Boolean(e);return r.inverse?!t:t}if("array"===r.type){const n=(s||window.document).querySelectorAll(r.selector);if(r.items){const e=[];for(const s of n)e.push(t(r.items,s));return e}return[...n].map(t=>e(t,r.parseFrom))}if("object"===r.type){const e={};for(const{key:n,value:o}of r.keys)e[n]=t(o,s);return e}return null}class r{constructor(){this.events=[]}createUnwatcher(e,t){return()=>{for(let e=0;e<this.events.length;e++){const r=this.events[e];r.handlers=r.handlers.filter(e=>e!==t),r.handlers.length||(this.events.splice(e,1),e--)}}}on(e,t){const r=this.createUnwatcher(e,t),s=this.events.find(t=>t.eventName===e);return s&&s.handlers.includes(t)||(s?s.handlers.push(t):this.events.push({eventName:e,handlers:[t]})),r}off(e,t){this.createUnwatcher(e,t)()}dispatch(e,t){const r=this.events.find(t=>t.eventName===e);if(r)for(const e of r.handlers)e(t)}}const s={attributes:!1,childList:!0,subtree:!0,characterData:!1,characterDataOldValue:!1,attributeOldValue:!1},n="target-element-found",o="target-element-mutated";class i extends r{constructor(e=document.body){super(),this._rootElement=e,this._mainObserver=null,this._targetElementsObservers=[],this._targetElementsDescriptors=[],this._onRootElementMutated=e=>{for(const t of e)if("childList"===t.type){for(const r of t.addedNodes)if(r instanceof window.Element)for(const t of this._targetElementsDescriptors)this._checkTargetSelectorAndObserve(t,r,e);this._clearObservedElementsByMutation(t)}}}_checkTargetSelectorAndObserve(e,t,r){const s=[...t.querySelectorAll(e.selector)];if(t.matches(e.selector)&&s.push(t),!s.length)return;this._observeTargetElements(s,e);const n=this._matchTargetElementMutations(e,r);for(const{target:t,mutations:r}of n)this._dispatchMutatedEvent(t,r,e)}_matchTargetElementMutations(e,t){const r=[];for(const s of t){if(!(s.target instanceof Element))continue;const t=s.target.closest(e.selector);if(!t)continue;const n=r.find(e=>e.target===t);n?n.mutations.push(s):r.push({target:t,mutations:[s]})}return r}_observeTargetElements(e,t){const r=this._targetElementsObservers.find(e=>e.descriptor===t),s=r||{descriptor:t,observedElements:[]};r||this._targetElementsObservers.push(s);for(const r of e){if(s.observedElements.some(({element:e})=>e===r))continue;const e=new window.MutationObserver(e=>this._onTargetElementMutated(r,e,t));this._dispatchFoundEvent(t,r),e.observe(r,t.observerConfig),s.observedElements.push({element:r,observer:e})}}_onTargetElementMutated(e,t,r){this._dispatchMutatedEvent(e,t,r)}_dispatchMutatedEvent(e,t,r){const s={type:"target-element-mutated",descriptor:r,mutations:t,element:e};this.dispatch("target-element-mutated",s)}_dispatchFoundEvent(e,t){const r={type:"target-element-found",descriptor:e,element:t};this.dispatch("target-element-found",r)}_clearObservedElementsByMutation(e){if(e.removedNodes&&e.removedNodes.length){for(const{descriptor:t,observedElements:r}of this._targetElementsObservers)for(let s=0;s<r.length;s++){const{element:n,observer:o}=r[s];if([...e.removedNodes].includes(n)){const e=o.takeRecords();e.length&&this._onTargetElementMutated(n,e,t),o.disconnect(),r.splice(s,1),s--}}for(let e=0;e<this._targetElementsObservers.length;e++){this._targetElementsObservers[e].observedElements.length||(this._targetElementsObservers.splice(e,1),e--)}}}_clearObservedElementsByDescriptor(e){const t=this._targetElementsObservers.findIndex(t=>t.descriptor===e);if(-1===t)return;const{observedElements:r}=this._targetElementsObservers[t];for(let t=0;t<r.length;t++){const{element:s,observer:n}=r[t],o=n.takeRecords();o.length&&this._onTargetElementMutated(s,o,e),n.disconnect(),r.splice(t,1),t--}}get observed(){return this._targetElementsObservers}start(e){return this._mainObserver=new window.MutationObserver(t=>{this._onRootElementMutated(t),e&&e(t)}),this._mainObserver.observe(this._rootElement,s),this}stop(){return this._mainObserver&&(this._mainObserver.disconnect(),this._onRootElementMutated(this._mainObserver.takeRecords()),this._mainObserver=null),this.stopObservation(),this}subscribe(e,t){const r=r=>{t?t.name===r.descriptor.name&&e(r):e(r)};return this.on("target-element-mutated",r),this.on("target-element-found",r),()=>{this.off("target-element-mutated",r),this.off("target-element-found",r)}}stopObservation(e){for(let t=0;t<this._targetElementsObservers.length;t++){const r=this._targetElementsObservers[t];e&&r.descriptor.name!==e||(this._clearObservedElementsByDescriptor(r.descriptor),this._targetElementsObservers.splice(t,1),t--)}if(!e)return this._targetElementsDescriptors=[],this;const t=this._targetElementsDescriptors.filter(t=>t.name!==e);return this._targetElementsDescriptors=t,this}observe(e){this._targetElementsDescriptors.push(e);const t=[...this._rootElement.querySelectorAll(e.selector)];return t.length&&this._observeTargetElements(t,e),this}}const a={attributes:!1,childList:!0,subtree:!0,characterData:!1,characterDataOldValue:!1,attributeOldValue:!1},l=({targets:e,onCollect:r,rootEl:s,mainObserverCallback:n})=>{const o=new i(s||document.body);o.start(n);for(const s of e){const{mapResult:e}=s,n={name:s.name,selector:s.targetSelector,observerConfig:s.observeConfig||a};o.subscribe(n=>{const{element:o}=n,{guardSelector:i,childGuardSelector:a,guard:l}=s;if(!i||document.querySelector(i)){let n;if(n=s.parseRootEl?"string"==typeof s.parseRootEl?document.querySelector(s.parseRootEl):s.parseRootEl:o,!n)return;if(a&&!n.querySelector(a))return;if(l&&!l(n))return;const i=t(s.parseConfig,n);r({name:s.name,payload:s.payload,parsedContent:e?e(i):i})}},n),o.observe(n)}return o};export{i as DomObserver,r as EventEmitter,n as FOUND_EVENT_NAME,o as MUTATED_EVENT_NAME,l as createDomCollector,t as parseDOM};
//# sourceMappingURL=dom-observer.es.js.map
