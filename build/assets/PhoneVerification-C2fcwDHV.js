import{c as gr,k as Fs,r as g,j as u,S as $s,X as Vs,M as Ct,m as Bs,a as Tn}from"./index-CW8y8ZVV.js";import{u as Hs,n as Ws,E as Sn}from"./egypt-CHqHo4eX.js";import{u as zs,L as dt}from"./useDebounce-c8gru10r.js";import{C as qs}from"./crosshair-K8OAQrTd.js";import{C as ht}from"./circle-alert-BreBolnx.js";import{C as Be}from"./circle-check-klvWOjv7.js";import{P as Gs}from"./pencil-Duff7UwD.js";import{R as Ks}from"./refresh-cw-C3NeqhO3.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Js=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8",key:"7n84p3"}]],Uu=gr("at-sign",Js);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ys=[["polygon",{points:"3 11 22 2 13 21 11 13 3 11",key:"1ltx0t"}]],kn=gr("navigation",Ys);class ye extends Error{constructor(e,n="network"){super(e),this.kind=n,this.name="GeocodingError"}}async function yr(t,e){let n;try{n=await fetch(Fs(t),{signal:e,headers:{Accept:"application/json"}})}catch(r){throw r?.name==="AbortError"?new ye("Lookup cancelled.","aborted"):new ye("Network error while contacting the location service.","network")}if(n.status===429)throw new ye("The location service is busy. Please wait a moment and try again.","rate-limit");if(!n.ok)throw new ye("The location service is temporarily unavailable.","network");return n.json()}async function Xs(t,e,n){const r=new URLSearchParams({lat:String(t),lon:String(e)}),s=await yr(`/api/geo/reverse?${r.toString()}`,n);return!s||!s.address?null:{latitude:typeof s.latitude=="number"?s.latitude:t,longitude:typeof s.longitude=="number"?s.longitude:e,address:String(s.address),city:s.city||"",country:s.country||"",countryCode:s.countryCode||"",postcode:s.postcode||""}}async function Qs(t,e){const n=t.trim();if(n.length<3)return[];const r=new URLSearchParams({q:n}),s=await yr(`/api/geo/search?${r.toString()}`,e);return Array.isArray(s)?s.filter(i=>i&&Number.isFinite(i.latitude)&&Number.isFinite(i.longitude)&&i.label).map(i=>({latitude:i.latitude,longitude:i.longitude,label:String(i.label),type:i.type||"place"})):[]}const it=t=>Math.round(t*1e6)/1e6,Zs=`
<svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="lpg" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
      <stop stop-color="#f0e5c8"/><stop offset="0.5" stop-color="#c9a961"/><stop offset="1" stop-color="#8b6914"/>
    </linearGradient>
  </defs>
  <path d="M15 0C7 0 0 6.4 0 15c0 10.2 13.1 23.6 14.2 24.7a1.1 1.1 0 0 0 1.6 0C16.9 38.6 30 25.2 30 15 30 6.4 23 0 15 0Z" fill="url(#lpg)" stroke="#5d4509" stroke-width="1"/>
  <circle cx="15" cy="14.5" r="5.4" fill="#0a0d18"/>
</svg>`;function ju({value:t,onChange:e,height:n=380,error:r,idPrefix:s="lp"}){const{L:i,error:a}=Hs(),o=g.useRef(null),c=g.useRef(null),l=g.useRef(null),d=g.useRef(!1),p=g.useRef(null),y=g.useRef(null),w=g.useRef(e);w.current=e;const C=g.useRef(t);C.current=t;const[k,N]=g.useState({kind:"idle"}),[j,de]=g.useState(!1),[Te,nt]=g.useState(""),[ee,Se]=g.useState(""),[D,E]=g.useState(""),te=`${s}-error`,Ue=`${s}-manual-err`,[q,je]=g.useState(""),Fe=zs(q,450),[L,he]=g.useState([]),[ke,v]=g.useState(!1),[x,F]=g.useState(!1),[$e,rt]=g.useState(-1),st=`${s}-suggest`,Ce=g.useCallback(async(f,m)=>{p.current?.abort();const b=new AbortController;p.current=b,N({kind:"loading",msg:"Resolving address for this location…"});const O=Ws(f,m).name;let R=null;try{R=await Xs(f,m,b.signal)}catch(me){if(b.signal.aborted||me instanceof ye&&me.kind==="aborted")return;const Re={latitude:it(f),longitude:it(m),country:"",city:O,address:"",governorate:O,locationVerified:!1,updatedAt:new Date().toISOString()};d.current=!0,w.current(Re),N({kind:"error",msg:me instanceof ye?me.message:"We could not resolve an address. Please try another point."});return}if(b.signal.aborted)return;const pe=R?.address||"",kt={latitude:it(f),longitude:it(m),country:R?.country||"",city:R?.city||O,address:pe,governorate:O,locationVerified:!!pe,updatedAt:new Date().toISOString()};d.current=!0,w.current(kt),N(pe?{kind:"success",msg:`Location confirmed — ${pe}`}:{kind:"error",msg:"No address found for that exact point. Please pick a more precise spot."})},[]),fe=g.useCallback((f,m)=>{if(!(!i||!c.current))if(l.current)l.current.setLatLng([f,m]);else{const b=i.divIcon({className:"lp-pin",html:Zs,iconSize:[30,40],iconAnchor:[15,40]}),O=i.marker([f,m],{draggable:!0,icon:b,keyboard:!1,title:"Drag to fine-tune your location"});O.addTo(c.current),O.on("dragend",()=>{const R=O.getLatLng();Ce(R.lat,R.lng)}),l.current=O}},[i,Ce]);g.useEffect(()=>{if(!i||!o.current||c.current)return;const f=C.current,m=typeof f?.latitude=="number"&&typeof f?.longitude=="number",b=m?f.latitude:Sn.lat,O=m?f.longitude:Sn.lng,R=i.map(o.current,{zoomControl:!0,scrollWheelZoom:!0}).setView([b,O],m?15:6);i.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(R),c.current=R,m&&fe(b,O),R.on("click",Re=>{fe(Re.latlng.lat,Re.latlng.lng),Ce(Re.latlng.lat,Re.latlng.lng)});const pe=()=>R.invalidateSize(),kt=setTimeout(pe,200),me=typeof ResizeObserver<"u"?new ResizeObserver(pe):null;return me?.observe(o.current),()=>{clearTimeout(kt),me?.disconnect(),p.current?.abort(),y.current?.abort(),R.remove(),c.current=null,l.current=null}},[i]),g.useEffect(()=>{if(d.current){d.current=!1;return}!i||!c.current||typeof t?.latitude!="number"||typeof t?.longitude!="number"||(fe(t.latitude,t.longitude),c.current.setView([t.latitude,t.longitude],Math.max(c.current.getZoom(),14)))},[t?.latitude,t?.longitude,i,fe]),g.useEffect(()=>{const f=Fe.trim();if(f.length<3){he([]),v(!1);return}y.current?.abort();const m=new AbortController;y.current=m,v(!0),Qs(f,m.signal).then(b=>{m.signal.aborted||(he(b),rt(-1),F(!0))}).catch(b=>{m.signal.aborted||b instanceof ye&&b.kind==="aborted"||he([])}).finally(()=>{m.signal.aborted||v(!1)})},[Fe]);const En=f=>{F(!1),he([]),je(""),c.current&&c.current.setView([f.latitude,f.longitude],16),fe(f.latitude,f.longitude),Ce(f.latitude,f.longitude)},Ls=f=>{!x||L.length===0||(f.key==="ArrowDown"?(f.preventDefault(),rt(m=>(m+1)%L.length)):f.key==="ArrowUp"?(f.preventDefault(),rt(m=>m<=0?L.length-1:m-1)):f.key==="Enter"&&$e>=0?(f.preventDefault(),En(L[$e])):f.key==="Escape"&&F(!1))},Ms=()=>{if(typeof navigator>"u"||!navigator.geolocation){N({kind:"error",msg:"Your browser does not support location access. Search above, tap the map, or enter coordinates manually."});return}if(typeof window<"u"&&!window.isSecureContext){N({kind:"error",msg:"Location access needs a secure (https) connection. Search above, tap the map, or enter coordinates manually."});return}de(!0),N({kind:"loading",msg:"Getting your current location…"}),navigator.geolocation.getCurrentPosition(f=>{de(!1);const{latitude:m,longitude:b}=f.coords;c.current&&c.current.setView([m,b],16),fe(m,b),Ce(m,b)},f=>{de(!1);const m=f.code===f.PERMISSION_DENIED?"Location permission is blocked. Enable it in your browser settings, or search / tap the map / enter coordinates instead.":f.code===f.TIMEOUT?"Locating timed out. Try again, or search / tap the map / enter coordinates instead.":"We couldn't determine your position. Try again, or search / tap the map / enter coordinates instead.";N({kind:"error",msg:m})},{enableHighAccuracy:!0,timeout:15e3,maximumAge:6e4})},Us=()=>{const f=Number(Te),m=Number(ee);if(!Number.isFinite(f)||!Number.isFinite(m)||f<-90||f>90||m<-180||m>180){E("Enter a valid latitude (-90 to 90) and longitude (-180 to 180).");return}E(""),c.current&&c.current.setView([f,m],16),fe(f,m),Ce(f,m)},js=typeof t?.latitude=="number"&&typeof t?.longitude=="number",vn=!!(t?.locationVerified&&t?.address);return u.jsxs("div",{className:"lp-root",children:[u.jsxs("div",{className:"flex flex-col sm:flex-row gap-3 mb-3",children:[u.jsxs("div",{className:"lp-search flex-1",children:[u.jsx("label",{htmlFor:`${s}-search`,className:"lp-sr-only",children:"Search for a place or address"}),u.jsxs("div",{className:"relative",children:[u.jsx($s,{className:"w-4 h-4 text-luxury-gold absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none","aria-hidden":"true"}),u.jsx("input",{id:`${s}-search`,type:"text",role:"combobox","aria-expanded":x&&L.length>0,"aria-controls":x&&L.length>0?st:void 0,"aria-autocomplete":"list","aria-activedescendant":$e>=0?`${st}-opt-${$e}`:void 0,autoComplete:"off",value:q,onChange:f=>{je(f.target.value),F(!0)},onKeyDown:Ls,onFocus:()=>{L.length&&F(!0)},placeholder:"Search a city, street or landmark…",className:"w-full rounded-xl border pl-9 pr-9 py-3 text-sm focus:outline-none"}),(ke||q)&&u.jsx("span",{className:"absolute right-3 top-1/2 -translate-y-1/2",children:ke?u.jsx(dt,{className:"w-4 h-4 text-luxury-gold animate-spin","aria-hidden":"true"}):u.jsx("button",{type:"button",onClick:()=>{je(""),he([]),F(!1)},"aria-label":"Clear search",className:"text-ink-400 hover:text-luxury-gold",children:u.jsx(Vs,{className:"w-4 h-4"})})})]}),x&&L.length>0&&u.jsx("ul",{className:"lp-suggest",id:st,role:"listbox","aria-label":"Location suggestions",children:L.map((f,m)=>u.jsxs("li",{id:`${st}-opt-${m}`,role:"option","aria-selected":m===$e,className:"lp-suggest__item",onMouseEnter:()=>rt(m),onMouseDown:b=>{b.preventDefault(),En(f)},children:[u.jsx(Ct,{className:"w-4 h-4 mt-0.5 text-luxury-gold flex-none","aria-hidden":"true"}),u.jsx("span",{className:"leading-snug",children:f.label})]},`${f.latitude}-${f.longitude}-${m}`))})]}),u.jsxs("button",{type:"button",onClick:Ms,disabled:j,className:"btn-luxury !py-3 whitespace-nowrap disabled:opacity-60",children:[j?u.jsx(dt,{className:"w-4 h-4 animate-spin","aria-hidden":"true"}):u.jsx(qs,{className:"w-4 h-4","aria-hidden":"true"}),"Use My Current Location"]})]}),a?u.jsx("div",{className:"lp-map is-error flex items-center justify-center text-center p-6",style:{height:n},role:"alert",children:u.jsx("p",{className:"text-sm text-[#e3a4ad] max-w-sm",children:"The map could not be loaded. You can still search for a place above or enter coordinates manually below to set your location."})}):u.jsxs("div",{className:"relative",children:[u.jsx("div",{ref:o,style:{height:n},className:`lp-map ${r?"is-error":""}`,role:"application","aria-label":"Interactive map. Click to drop a pin, or use the search box, the Use My Current Location button, or the manual coordinate fields to set your location.","aria-invalid":r?!0:void 0,"aria-describedby":r?te:void 0}),!i&&u.jsxs("div",{className:"absolute inset-0 flex items-center justify-center gap-2 pointer-events-none","aria-hidden":"true",children:[u.jsx("span",{className:"lp-spin"}),u.jsx("span",{className:"text-sm text-ink-300",children:"Loading map…"})]})]}),u.jsxs("p",{className:"mt-2 text-xs text-ink-300 flex items-center gap-1.5",children:[u.jsx(Ct,{className:"w-3.5 h-3.5 text-luxury-gold","aria-hidden":"true"}),"Click anywhere on the map to drop a pin, then drag it to fine-tune."]}),u.jsxs("details",{className:"mt-2 group",children:[u.jsxs("summary",{className:"text-xs text-ink-300 cursor-pointer select-none hover:text-luxury-gold inline-flex items-center gap-1.5",children:[u.jsx(kn,{className:"w-3.5 h-3.5","aria-hidden":"true"}),"Enter coordinates manually"]}),u.jsxs("div",{className:"mt-3 flex flex-col sm:flex-row sm:items-end gap-3",children:[u.jsxs("div",{className:"flex-1",children:[u.jsx("label",{htmlFor:`${s}-mlat`,className:"block text-xs text-ink-300 mb-1",children:"Latitude"}),u.jsx("input",{id:`${s}-mlat`,type:"number",inputMode:"decimal",step:"any",placeholder:"30.0444",value:Te,onChange:f=>nt(f.target.value),"aria-invalid":D?!0:void 0,"aria-describedby":D?Ue:void 0,className:"w-full rounded-xl border px-3 py-2.5 text-sm lp-coord focus:outline-none"})]}),u.jsxs("div",{className:"flex-1",children:[u.jsx("label",{htmlFor:`${s}-mlng`,className:"block text-xs text-ink-300 mb-1",children:"Longitude"}),u.jsx("input",{id:`${s}-mlng`,type:"number",inputMode:"decimal",step:"any",placeholder:"31.2357",value:ee,onChange:f=>Se(f.target.value),"aria-invalid":D?!0:void 0,"aria-describedby":D?Ue:void 0,className:"w-full rounded-xl border px-3 py-2.5 text-sm lp-coord focus:outline-none"})]}),u.jsxs("button",{type:"button",onClick:Us,className:"btn-ghost !py-2.5 whitespace-nowrap",children:[u.jsx(Ct,{className:"w-4 h-4","aria-hidden":"true"})," Place pin"]})]}),D&&u.jsx("p",{id:Ue,className:"mt-2 text-xs text-[#e3a4ad]",role:"alert",children:D})]}),u.jsxs("div",{"aria-live":"polite",className:"mt-3",children:[k.kind==="loading"&&u.jsxs("div",{className:"lp-status lp-status--loading",children:[u.jsx("span",{className:"lp-spin","aria-hidden":"true"}),u.jsx("span",{children:k.msg})]}),k.kind==="error"&&u.jsxs("div",{className:"lp-status lp-status--error",children:[u.jsx(ht,{className:"w-4 h-4 flex-none","aria-hidden":"true"}),u.jsx("span",{children:k.msg})]}),k.kind==="success"&&u.jsxs("div",{className:"lp-status lp-status--success",children:[u.jsx(Be,{className:"w-4 h-4 flex-none","aria-hidden":"true"}),u.jsx("span",{children:k.msg})]})]}),r&&u.jsxs("div",{id:te,className:"lp-status lp-status--error mt-3",role:"alert",children:[u.jsx(ht,{className:"w-4 h-4 flex-none","aria-hidden":"true"}),u.jsx("span",{children:r})]}),js&&u.jsxs("div",{className:"grid sm:grid-cols-2 gap-3 mt-4",children:[u.jsxs("div",{className:`lp-preview p-4 ${vn?"is-verified":""}`,children:[u.jsxs("div",{className:"flex items-center justify-between mb-2",children:[u.jsx("p",{className:"text-xs uppercase tracking-wider text-ink-300",children:"Resolved Address"}),vn?u.jsxs("span",{className:"pill pill-success",children:[u.jsx(Be,{className:"w-3 h-3","aria-hidden":"true"})," Verified"]}):u.jsx("span",{className:"pill pill-warning",children:"Unconfirmed"})]}),u.jsx("p",{className:"text-sm text-ink-100 leading-snug",children:t?.address||"Pick a precise point to resolve the address."}),(t?.city||t?.country)&&u.jsxs("div",{className:"flex flex-wrap gap-1.5 mt-2.5",children:[t?.governorate&&u.jsx("span",{className:"pill pill-brand",children:t.governorate}),t?.city&&t.city!==t.governorate&&u.jsx("span",{className:"pill pill-info",children:t.city}),t?.country&&u.jsx("span",{className:"pill pill-info",children:t.country})]})]}),u.jsxs("div",{className:"lp-preview p-4",children:[u.jsxs("p",{className:"text-xs uppercase tracking-wider text-ink-300 mb-2 flex items-center gap-1.5",children:[u.jsx(kn,{className:"w-3.5 h-3.5 text-luxury-gold","aria-hidden":"true"})," Coordinates"]}),u.jsxs("div",{className:"space-y-1.5",children:[u.jsxs("div",{className:"flex items-center justify-between",children:[u.jsx("span",{className:"text-xs text-ink-300",children:"Latitude"}),u.jsx("span",{className:"lp-coord text-sm text-ink-100",children:t.latitude.toFixed(6)})]}),u.jsxs("div",{className:"flex items-center justify-between",children:[u.jsx("span",{className:"text-xs text-ink-300",children:"Longitude"}),u.jsx("span",{className:"lp-coord text-sm text-ink-100",children:t.longitude.toFixed(6)})]})]})]})]})]})}const ei=()=>{};var Cn={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ir=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let s=t.charCodeAt(r);s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=s&63|128):(s&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=s&63|128):(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=s&63|128)}return e},ti=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const s=t[n++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=t[n++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=t[n++],a=t[n++],o=t[n++],c=((s&7)<<18|(i&63)<<12|(a&63)<<6|o&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const i=t[n++],a=t[n++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return e.join("")},wr={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<t.length;s+=3){const i=t[s],a=s+1<t.length,o=a?t[s+1]:0,c=s+2<t.length,l=c?t[s+2]:0,d=i>>2,p=(i&3)<<4|o>>4;let y=(o&15)<<2|l>>6,w=l&63;c||(w=64,a||(y=64)),r.push(n[d],n[p],n[y],n[w])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Ir(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):ti(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<t.length;){const i=n[t.charAt(s++)],o=s<t.length?n[t.charAt(s)]:0;++s;const l=s<t.length?n[t.charAt(s)]:64;++s;const p=s<t.length?n[t.charAt(s)]:64;if(++s,i==null||o==null||l==null||p==null)throw new ni;const y=i<<2|o>>4;if(r.push(y),l!==64){const w=o<<4&240|l>>2;if(r.push(w),p!==64){const C=l<<6&192|p;r.push(C)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class ni extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const ri=function(t){const e=Ir(t);return wr.encodeByteArray(e,!0)},br=function(t){return ri(t).replace(/\./g,"")},_r=function(t){try{return wr.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function si(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ii=()=>si().__FIREBASE_DEFAULTS__,ai=()=>{if(typeof process>"u"||typeof Cn>"u")return;const t=Cn.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},oi=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&_r(t[1]);return e&&JSON.parse(e)},Qt=()=>{try{return ei()||ii()||ai()||oi()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},ci=t=>Qt()?.emulatorHosts?.[t],Er=()=>Qt()?.config,vr=t=>Qt()?.[`_${t}`];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tr{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function S(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function li(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(S())}function ui(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Zt(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function di(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function hi(){const t=S();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function en(){try{return typeof indexedDB=="object"}catch{return!1}}function tn(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{e(s.error?.message||"")}}catch(n){e(n)}})}function Sr(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fi="FirebaseError";class H extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=fi,Object.setPrototypeOf(this,H.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ve.prototype.create)}}class ve{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},s=`${this.service}/${e}`,i=this.errors[e],a=i?pi(i,r):"Error",o=`${this.serviceName}: ${a} (${s}).`;return new H(s,o,r)}}function pi(t,e){return t.replace(mi,(n,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const mi=/\{\$([^}]+)}/g;function gi(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function we(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const s of n){if(!r.includes(s))return!1;const i=t[s],a=e[s];if(Rn(i)&&Rn(a)){if(!we(i,a))return!1}else if(i!==a)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function Rn(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Le(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function yi(t,e){const n=new Ii(t,e);return n.subscribe.bind(n)}class Ii{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let s;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");wi(e,["next","error","complete"])?s=e:s={next:e,error:n,complete:r},s.next===void 0&&(s.next=Rt),s.error===void 0&&(s.error=Rt),s.complete===void 0&&(s.complete=Rt);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function wi(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function Rt(){}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bi=1e3,_i=2,Ei=14400*1e3,vi=.5;function An(t,e=bi,n=_i){const r=e*Math.pow(n,t),s=Math.round(vi*r*(Math.random()-.5)*2);return Math.min(Ei,r+s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function W(t){return t&&t._delegate?t._delegate:t}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nn(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Ti(t){return(await fetch(t,{credentials:"include"})).ok}class B{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ge="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Si{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new Tr;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:n});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){const n=this.normalizeInstanceIdentifier(e?.identifier),r=e?.optional??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(s){if(r)return null;throw s}else{if(r)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Ci(e))try{this.getOrInitializeService({instanceIdentifier:ge})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(n);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=ge){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=ge){return this.instances.has(e)}getOptions(e=ge){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[i,a]of this.instancesDeferred.entries()){const o=this.normalizeInstanceIdentifier(i);r===o&&a.resolve(s)}return s}onInit(e,n){const r=this.normalizeInstanceIdentifier(n),s=this.onInitCallbacks.get(r)??new Set;s.add(e),this.onInitCallbacks.set(r,s);const i=this.instances.get(r);return i&&e(i,r),()=>{s.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const s of r)try{s(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:ki(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=ge){return this.component?this.component.multipleInstances?e:ge:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function ki(t){return t===ge?void 0:t}function Ci(t){return t.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ri{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Si(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var I;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(I||(I={}));const Ai={debug:I.DEBUG,verbose:I.VERBOSE,info:I.INFO,warn:I.WARN,error:I.ERROR,silent:I.SILENT},Pi=I.INFO,Ni={[I.DEBUG]:"log",[I.VERBOSE]:"log",[I.INFO]:"info",[I.WARN]:"warn",[I.ERROR]:"error"},xi=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),s=Ni[e];if(s)console[s](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class rn{constructor(e){this.name=e,this._logLevel=Pi,this._logHandler=xi,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in I))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Ai[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,I.DEBUG,...e),this._logHandler(this,I.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,I.VERBOSE,...e),this._logHandler(this,I.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,I.INFO,...e),this._logHandler(this,I.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,I.WARN,...e),this._logHandler(this,I.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,I.ERROR,...e),this._logHandler(this,I.ERROR,...e)}}const Oi=(t,e)=>e.some(n=>t instanceof n);let Pn,Nn;function Di(){return Pn||(Pn=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Li(){return Nn||(Nn=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const kr=new WeakMap,Bt=new WeakMap,Cr=new WeakMap,At=new WeakMap,sn=new WeakMap;function Mi(t){const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("success",i),t.removeEventListener("error",a)},i=()=>{n(oe(t.result)),s()},a=()=>{r(t.error),s()};t.addEventListener("success",i),t.addEventListener("error",a)});return e.then(n=>{n instanceof IDBCursor&&kr.set(n,t)}).catch(()=>{}),sn.set(e,t),e}function Ui(t){if(Bt.has(t))return;const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",a),t.removeEventListener("abort",a)},i=()=>{n(),s()},a=()=>{r(t.error||new DOMException("AbortError","AbortError")),s()};t.addEventListener("complete",i),t.addEventListener("error",a),t.addEventListener("abort",a)});Bt.set(t,e)}let Ht={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return Bt.get(t);if(e==="objectStoreNames")return t.objectStoreNames||Cr.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return oe(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function ji(t){Ht=t(Ht)}function Fi(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(Pt(this),e,...n);return Cr.set(r,e.sort?e.sort():[e]),oe(r)}:Li().includes(t)?function(...e){return t.apply(Pt(this),e),oe(kr.get(this))}:function(...e){return oe(t.apply(Pt(this),e))}}function $i(t){return typeof t=="function"?Fi(t):(t instanceof IDBTransaction&&Ui(t),Oi(t,Di())?new Proxy(t,Ht):t)}function oe(t){if(t instanceof IDBRequest)return Mi(t);if(At.has(t))return At.get(t);const e=$i(t);return e!==t&&(At.set(t,e),sn.set(e,t)),e}const Pt=t=>sn.get(t);function Rr(t,e,{blocked:n,upgrade:r,blocking:s,terminated:i}={}){const a=indexedDB.open(t,e),o=oe(a);return r&&a.addEventListener("upgradeneeded",c=>{r(oe(a.result),c.oldVersion,c.newVersion,oe(a.transaction),c)}),n&&a.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),o.then(c=>{i&&c.addEventListener("close",()=>i()),s&&c.addEventListener("versionchange",l=>s(l.oldVersion,l.newVersion,l))}).catch(()=>{}),o}const Vi=["get","getKey","getAll","getAllKeys","count"],Bi=["put","add","delete","clear"],Nt=new Map;function xn(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(Nt.get(e))return Nt.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,s=Bi.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(s||Vi.includes(n)))return;const i=async function(a,...o){const c=this.transaction(a,s?"readwrite":"readonly");let l=c.store;return r&&(l=l.index(o.shift())),(await Promise.all([l[n](...o),s&&c.done]))[0]};return Nt.set(e,i),i}ji(t=>({...t,get:(e,n,r)=>xn(e,n)||t.get(e,n,r),has:(e,n)=>!!xn(e,n)||t.has(e,n)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hi{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(Wi(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function Wi(t){return t.getComponent()?.type==="VERSION"}const Wt="@firebase/app",On="0.15.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Y=new rn("@firebase/app"),zi="@firebase/app-compat",qi="@firebase/analytics-compat",Gi="@firebase/analytics",Ki="@firebase/app-check-compat",Ji="@firebase/app-check",Yi="@firebase/auth",Xi="@firebase/auth-compat",Qi="@firebase/database",Zi="@firebase/data-connect",ea="@firebase/database-compat",ta="@firebase/functions",na="@firebase/functions-compat",ra="@firebase/installations",sa="@firebase/installations-compat",ia="@firebase/messaging",aa="@firebase/messaging-compat",oa="@firebase/performance",ca="@firebase/performance-compat",la="@firebase/remote-config",ua="@firebase/remote-config-compat",da="@firebase/storage",ha="@firebase/storage-compat",fa="@firebase/firestore",pa="@firebase/ai",ma="@firebase/firestore-compat",ga="firebase",ya="12.15.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zt="[DEFAULT]",Ia={[Wt]:"fire-core",[zi]:"fire-core-compat",[Gi]:"fire-analytics",[qi]:"fire-analytics-compat",[Ji]:"fire-app-check",[Ki]:"fire-app-check-compat",[Yi]:"fire-auth",[Xi]:"fire-auth-compat",[Qi]:"fire-rtdb",[Zi]:"fire-data-connect",[ea]:"fire-rtdb-compat",[ta]:"fire-fn",[na]:"fire-fn-compat",[ra]:"fire-iid",[sa]:"fire-iid-compat",[ia]:"fire-fcm",[aa]:"fire-fcm-compat",[oa]:"fire-perf",[ca]:"fire-perf-compat",[la]:"fire-rc",[ua]:"fire-rc-compat",[da]:"fire-gcs",[ha]:"fire-gcs-compat",[fa]:"fire-fst",[ma]:"fire-fst-compat",[pa]:"fire-vertex","fire-js":"fire-js",[ga]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ke=new Map,wa=new Map,qt=new Map;function Dn(t,e){try{t.container.addComponent(e)}catch(n){Y.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function X(t){const e=t.name;if(qt.has(e))return Y.debug(`There were multiple attempts to register component ${e}.`),!1;qt.set(e,t);for(const n of Ke.values())Dn(n,t);for(const n of wa.values())Dn(n,t);return!0}function Me(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function $(t){return t==null?!1:t.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ba={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},ce=new ve("app","Firebase",ba);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _a{constructor(e,n,r){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new B("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw ce.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xe=ya;function Ar(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r={name:zt,automaticDataCollectionEnabled:!0,...e},s=r.name;if(typeof s!="string"||!s)throw ce.create("bad-app-name",{appName:String(s)});if(n||(n=Er()),!n)throw ce.create("no-options");const i=Ke.get(s);if(i){if(we(n,i.options)&&we(r,i.config))return i;throw ce.create("duplicate-app",{appName:s})}const a=new Ri(s);for(const c of qt.values())a.addComponent(c);const o=new _a(n,r,a);return Ke.set(s,o),o}function an(t=zt){const e=Ke.get(t);if(!e&&t===zt&&Er())return Ar();if(!e)throw ce.create("no-app",{appName:t});return e}function Ea(){return Array.from(Ke.values())}function V(t,e,n){let r=Ia[t]??t;n&&(r+=`-${n}`);const s=r.match(/\s|\//),i=e.match(/\s|\//);if(s||i){const a=[`Unable to register library "${r}" with version "${e}":`];s&&a.push(`library name "${r}" contains illegal characters (whitespace or "/")`),s&&i&&a.push("and"),i&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Y.warn(a.join(" "));return}X(new B(`${r}-version`,()=>({library:r,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const va="firebase-heartbeat-database",Ta=1,Je="firebase-heartbeat-store";let xt=null;function Pr(){return xt||(xt=Rr(va,Ta,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Je)}catch(n){console.warn(n)}}}}).catch(t=>{throw ce.create("idb-open",{originalErrorMessage:t.message})})),xt}async function Sa(t){try{const n=(await Pr()).transaction(Je),r=await n.objectStore(Je).get(Nr(t));return await n.done,r}catch(e){if(e instanceof H)Y.warn(e.message);else{const n=ce.create("idb-get",{originalErrorMessage:e?.message});Y.warn(n.message)}}}async function Ln(t,e){try{const r=(await Pr()).transaction(Je,"readwrite");await r.objectStore(Je).put(e,Nr(t)),await r.done}catch(n){if(n instanceof H)Y.warn(n.message);else{const r=ce.create("idb-set",{originalErrorMessage:n?.message});Y.warn(r.message)}}}function Nr(t){return`${t.name}!${t.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ka=1024,Ca=30;class Ra{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new Pa(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){try{const n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=Mn();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some(s=>s.date===r))return;if(this._heartbeatsCache.heartbeats.push({date:r,agent:n}),this._heartbeatsCache.heartbeats.length>Ca){const s=Na(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(s,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){Y.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";const e=Mn(),{heartbeatsToSend:n,unsentEntries:r}=Aa(this._heartbeatsCache.heartbeats),s=br(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=e,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(e){return Y.warn(e),""}}}function Mn(){return new Date().toISOString().substring(0,10)}function Aa(t,e=ka){const n=[];let r=t.slice();for(const s of t){const i=n.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),Un(n)>e){i.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),Un(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class Pa{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return en()?tn().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await Sa(this.app);return n?.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Ln(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const r=await this.read();return Ln(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??r.lastSentHeartbeatDate,heartbeats:[...r.heartbeats,...e.heartbeats]})}else return}}function Un(t){return br(JSON.stringify({version:2,heartbeats:t})).length}function Na(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let r=1;r<t.length;r++)t[r].date<n&&(n=t[r].date,e=r);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xa(t){X(new B("platform-logger",e=>new Hi(e),"PRIVATE")),X(new B("heartbeat",e=>new Ra(e),"PRIVATE")),V(Wt,On,t),V(Wt,On,"esm2020"),V("fire-js","")}xa("");function xr(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Oa=xr,Or=new ve("auth","Firebase",xr());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ft=new rn("@firebase/auth");function Da(t,...e){ft.logLevel<=I.WARN&&ft.warn(`Auth (${Xe}): ${t}`,...e)}function ot(t,...e){ft.logLevel<=I.ERROR&&ft.error(`Auth (${Xe}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Q(t,...e){throw on(t,...e)}function A(t,...e){return on(t,...e)}function Dr(t,e,n){const r={...Oa(),[e]:n};return new ve("auth","Firebase",r).create(e,{appName:t.name})}function le(t){return Dr(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function on(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return Or.create(t,...e)}function h(t,e,...n){if(!t)throw on(e,...n)}function K(t){const e="INTERNAL ASSERTION FAILED: "+t;throw ot(e),new Error(e)}function Z(t,e){t||K(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gt(){return typeof self<"u"&&self.location?.href||""}function Lr(){return jn()==="http:"||jn()==="https:"}function jn(){return typeof self<"u"&&self.location?.protocol||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function La(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Lr()||Zt()||"connection"in navigator)?navigator.onLine:!0}function Ma(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qe{constructor(e,n){this.shortDelay=e,this.longDelay=n,Z(n>e,"Short delay should be less than long delay!"),this.isMobile=li()||di()}get(){return La()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cn(t,e){Z(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mr{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;K("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;K("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;K("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ua={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ja=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],Fa=new Qe(3e4,6e4);function z(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function U(t,e,n,r,s={}){return Ur(t,s,async()=>{let i={},a={};r&&(e==="GET"?a=r:i={body:JSON.stringify(r)});const o=Le({...a,key:t.config.apiKey}).slice(1),c=await t._getAdditionalHeaders();c["Content-Type"]="application/json",t.languageCode&&(c["X-Firebase-Locale"]=t.languageCode);const l={method:e,headers:c,...i};return ui()||(l.referrerPolicy="strict-origin-when-cross-origin"),t.emulatorConfig&&nn(t.emulatorConfig.host)&&(l.credentials="include"),Mr.fetch()(await jr(t,t.config.apiHost,n,o),l)})}async function Ur(t,e,n){t._canInitEmulator=!1;const r={...Ua,...e};try{const s=new Va(t),i=await Promise.race([n(),s.promise]);s.clearNetworkTimeout();const a=await i.json();if("needConfirmation"in a)throw Ve(t,"account-exists-with-different-credential",a);if(i.ok&&!("errorMessage"in a))return a;{const o=i.ok?a.errorMessage:a.error.message,[c,l]=o.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Ve(t,"credential-already-in-use",a);if(c==="EMAIL_EXISTS")throw Ve(t,"email-already-in-use",a);if(c==="USER_DISABLED")throw Ve(t,"user-disabled",a);const d=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(l)throw Dr(t,d,l);Q(t,d)}}catch(s){if(s instanceof H)throw s;Q(t,"network-request-failed",{message:String(s)})}}async function _t(t,e,n,r,s={}){const i=await U(t,e,n,r,s);return"mfaPendingCredential"in i&&Q(t,"multi-factor-auth-required",{_serverResponse:i}),i}async function jr(t,e,n,r){const s=`${e}${n}?${r}`,i=t,a=i.config.emulator?cn(t.config,s):`${t.config.apiScheme}://${s}`;return ja.includes(n)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(a).toString():a}function $a(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class Va{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(A(this.auth,"network-request-failed")),Fa.get())})}}function Ve(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const s=A(t,e,r);return s.customData._tokenResponse=n,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fn(t){return t!==void 0&&t.getResponse!==void 0}function $n(t){return t!==void 0&&t.enterprise!==void 0}class Fr{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return $a(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ba(t){return(await U(t,"GET","/v1/recaptchaParams")).recaptchaSiteKey||""}async function $r(t,e){return U(t,"GET","/v2/recaptchaConfig",z(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ha(t,e){return U(t,"POST","/v1/accounts:delete",e)}async function pt(t,e){return U(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function He(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Wa(t,e=!1){const n=W(t),r=await n.getIdToken(e),s=ln(r);h(s&&s.exp&&s.auth_time&&s.iat,n.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,a=i?.sign_in_provider;return{claims:s,token:r,authTime:He(Ot(s.auth_time)),issuedAtTime:He(Ot(s.iat)),expirationTime:He(Ot(s.exp)),signInProvider:a||null,signInSecondFactor:i?.sign_in_second_factor||null}}function Ot(t){return Number(t)*1e3}function ln(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return ot("JWT malformed, contained fewer than 3 sections"),null;try{const s=_r(n);return s?JSON.parse(s):(ot("Failed to decode base64 JWT payload"),null)}catch(s){return ot("Caught error parsing JWT payload as JSON",s?.toString()),null}}function Vn(t){const e=ln(t);return h(e,"internal-error"),h(typeof e.exp<"u","internal-error"),h(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ye(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof H&&za(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function za({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qa{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;const r=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,r)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kt{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=He(this.lastLoginAt),this.creationTime=He(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function mt(t){const e=t.auth,n=await t.getIdToken(),r=await Ye(t,pt(e,{idToken:n}));h(r?.users.length,e,"internal-error");const s=r.users[0];t._notifyReloadListener(s);const i=s.providerUserInfo?.length?Vr(s.providerUserInfo):[],a=Ka(t.providerData,i),o=t.isAnonymous,c=!(t.email&&s.passwordHash)&&!a?.length,l=o?c:!1,d={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:a,metadata:new Kt(s.createdAt,s.lastLoginAt),isAnonymous:l};Object.assign(t,d)}async function Ga(t){const e=W(t);await mt(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Ka(t,e){return[...t.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function Vr(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ja(t,e){const n=await Ur(t,{},async()=>{const r=Le({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=t.config,a=await jr(t,s,"/v1/token",`key=${i}`),o=await t._getAdditionalHeaders();o["Content-Type"]="application/x-www-form-urlencoded";const c={method:"POST",headers:o,body:r};return t.emulatorConfig&&nn(t.emulatorConfig.host)&&(c.credentials="include"),Mr.fetch()(a,c)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function Ya(t,e){return U(t,"POST","/v2/accounts:revokeToken",z(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pe{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){h(e.idToken,"internal-error"),h(typeof e.idToken<"u","internal-error"),h(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Vn(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){h(e.length!==0,"internal-error");const n=Vn(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(h(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:s,expiresIn:i}=await Ja(e,n);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:s,expirationTime:i}=n,a=new Pe;return r&&(h(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&(h(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),i&&(h(typeof i=="number","internal-error",{appName:e}),a.expirationTime=i),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Pe,this.toJSON())}_performRefresh(){return K("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ne(t,e){h(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class M{constructor({uid:e,auth:n,stsTokenManager:r,...s}){this.providerId="firebase",this.proactiveRefresh=new qa(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=r,this.accessToken=r.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Kt(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const n=await Ye(this,this.stsTokenManager.getToken(this.auth,e));return h(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return Wa(this,e)}reload(){return Ga(this)}_assign(e){this!==e&&(h(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new M({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){h(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await mt(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if($(this.auth.app))return Promise.reject(le(this.auth));const e=await this.getIdToken();return await Ye(this,Ha(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){const r=n.displayName??void 0,s=n.email??void 0,i=n.phoneNumber??void 0,a=n.photoURL??void 0,o=n.tenantId??void 0,c=n._redirectEventId??void 0,l=n.createdAt??void 0,d=n.lastLoginAt??void 0,{uid:p,emailVerified:y,isAnonymous:w,providerData:C,stsTokenManager:k}=n;h(p&&k,e,"internal-error");const N=Pe.fromJSON(this.name,k);h(typeof p=="string",e,"internal-error"),ne(r,e.name),ne(s,e.name),h(typeof y=="boolean",e,"internal-error"),h(typeof w=="boolean",e,"internal-error"),ne(i,e.name),ne(a,e.name),ne(o,e.name),ne(c,e.name),ne(l,e.name),ne(d,e.name);const j=new M({uid:p,auth:e,email:s,emailVerified:y,displayName:r,isAnonymous:w,photoURL:a,phoneNumber:i,tenantId:o,stsTokenManager:N,createdAt:l,lastLoginAt:d});return C&&Array.isArray(C)&&(j.providerData=C.map(de=>({...de}))),c&&(j._redirectEventId=c),j}static async _fromIdTokenResponse(e,n,r=!1){const s=new Pe;s.updateFromServerResponse(n);const i=new M({uid:n.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await mt(i),i}static async _fromGetAccountInfoResponse(e,n,r){const s=n.users[0];h(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Vr(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!i?.length,o=new Pe;o.updateFromIdToken(r);const c=new M({uid:s.localId,auth:e,stsTokenManager:o,isAnonymous:a}),l={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Kt(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!i?.length};return Object.assign(c,l),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bn=new Map;function J(t){Z(t instanceof Function,"Expected a class definition");let e=Bn.get(t);return e?(Z(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,Bn.set(t,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Br{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}Br.type="NONE";const Hn=Br;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ct(t,e,n){return`firebase:${t}:${e}:${n}`}class Ne{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=ct(this.userKey,s.apiKey,i),this.fullPersistenceKey=ct("persistence",s.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const n=await pt(this.auth,{idToken:e}).catch(()=>{});return n?M._fromGetAccountInfoResponse(this.auth,n,e):null}return M._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new Ne(J(Hn),e,r);const s=(await Promise.all(n.map(async l=>{if(await l._isAvailable())return l}))).filter(l=>l);let i=s[0]||J(Hn);const a=ct(r,e.config.apiKey,e.name);let o=null;for(const l of n)try{const d=await l._get(a);if(d){let p;if(typeof d=="string"){const y=await pt(e,{idToken:d}).catch(()=>{});if(!y)break;p=await M._fromGetAccountInfoResponse(e,y,d)}else p=M._fromJSON(e,d);l!==i&&(o=p),i=l;break}}catch{}const c=s.filter(l=>l._shouldAllowMigration);return!i._shouldAllowMigration||!c.length?new Ne(i,e,r):(i=c[0],o&&await i._set(a,o.toJSON()),await Promise.all(n.map(async l=>{if(l!==i)try{await l._remove(a)}catch{}})),new Ne(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wn(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(qr(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Hr(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Kr(e))return"Blackberry";if(Jr(e))return"Webos";if(Wr(e))return"Safari";if((e.includes("chrome/")||zr(e))&&!e.includes("edge/"))return"Chrome";if(Gr(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if(r?.length===2)return r[1]}return"Other"}function Hr(t=S()){return/firefox\//i.test(t)}function Wr(t=S()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function zr(t=S()){return/crios\//i.test(t)}function qr(t=S()){return/iemobile/i.test(t)}function Gr(t=S()){return/android/i.test(t)}function Kr(t=S()){return/blackberry/i.test(t)}function Jr(t=S()){return/webos/i.test(t)}function un(t=S()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function Xa(t=S()){return un(t)&&!!window.navigator?.standalone}function Qa(){return hi()&&document.documentMode===10}function Yr(t=S()){return un(t)||Gr(t)||Jr(t)||Kr(t)||/windows phone/i.test(t)||qr(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xr(t,e=[]){let n;switch(t){case"Browser":n=Wn(S());break;case"Worker":n=`${Wn(S())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Xe}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Za{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=i=>new Promise((a,o)=>{try{const c=e(i);a(c)}catch(c){o(c)}});r.onAbort=n,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const s of n)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r?.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function eo(t,e={}){return U(t,"GET","/v2/passwordPolicy",z(t,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const to=6;class no{constructor(e){const n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??to,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),s&&(n.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ro{constructor(e,n,r,s){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new zn(this),this.idTokenSubscription=new zn(this),this.beforeStateQueue=new Za(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Or,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=J(n)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await Ne.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await pt(this,{idToken:e}),r=await M._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if($(this.app)){const i=this.app.settings.authIdToken;return i?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(i).then(a,a))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let r=n,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const i=this.redirectUser?._redirectEventId,a=r?._redirectEventId,o=await this.tryRedirectSignIn(e);(!i||i===a)&&o?.user&&(r=o.user,s=!0)}if(!r)return this.directlySetCurrentUser(null);if(!r._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(r)}catch(i){r=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(i))}return r?this.reloadAndSetCurrentUserOrClear(r):this.directlySetCurrentUser(null)}return h(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===r._redirectEventId?this.directlySetCurrentUser(r):this.reloadAndSetCurrentUserOrClear(r)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await mt(e)}catch(n){if(n?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Ma()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if($(this.app))return Promise.reject(le(this));const n=e?W(e):null;return n&&h(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&h(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return $(this.app)?Promise.reject(le(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return $(this.app)?Promise.reject(le(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(J(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await eo(this),n=new no(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ve("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await Ya(this,r)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&J(e)||this._popupRedirectResolver;h(n,this,"argument-error"),this.redirectPersistenceManager=await Ne.create(this,[J(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,s){if(this._deleted)return()=>{};const i=typeof n=="function"?n:n.next.bind(n);let a=!1;const o=this._isInitialized?Promise.resolve():this._initializationPromise;if(h(o,this,"internal-error"),o.then(()=>{a||i(this.currentUser)}),typeof n=="function"){const c=e.addObserver(n,r,s);return()=>{a=!0,c()}}else{const c=e.addObserver(n);return()=>{a=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return h(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Xr(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const n=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();n&&(e["X-Firebase-Client"]=n);const r=await this._getAppCheckToken();return r&&(e["X-Firebase-AppCheck"]=r),e}async _getAppCheckToken(){if($(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&Da(`Error while retrieving App Check token: ${e.error}`),e?.token}}function ue(t){return W(t)}class zn{constructor(e){this.auth=e,this.observer=null,this.addObserver=yi(n=>this.observer=n)}get next(){return h(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ze={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function so(t){Ze=t}function dn(t){return Ze.loadJS(t)}function io(){return Ze.recaptchaV2Script}function ao(){return Ze.recaptchaEnterpriseScript}function oo(){return Ze.gapiScript}function Qr(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const co=500,lo=6e4,at=1e12;class uo{constructor(e){this.auth=e,this.counter=at,this._widgets=new Map}render(e,n){const r=this.counter;return this._widgets.set(r,new po(e,this.auth.name,n||{})),this.counter++,r}reset(e){const n=e||at;this._widgets.get(n)?.delete(),this._widgets.delete(n)}getResponse(e){const n=e||at;return this._widgets.get(n)?.getResponse()||""}async execute(e){const n=e||at;return this._widgets.get(n)?.execute(),""}}class ho{constructor(){this.enterprise=new fo}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}class fo{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}}class po{constructor(e,n,r){this.params=r,this.timerId=null,this.deleted=!1,this.responseToken=null,this.clickHandler=()=>{this.execute()};const s=typeof e=="string"?document.getElementById(e):e;h(s,"argument-error",{appName:n}),this.container=s,this.isVisible=this.params.size!=="invisible",this.isVisible?this.execute():this.container.addEventListener("click",this.clickHandler)}getResponse(){return this.checkIfDeleted(),this.responseToken}delete(){this.checkIfDeleted(),this.deleted=!0,this.timerId&&(clearTimeout(this.timerId),this.timerId=null),this.container.removeEventListener("click",this.clickHandler)}execute(){this.checkIfDeleted(),!this.timerId&&(this.timerId=window.setTimeout(()=>{this.responseToken=mo(50);const{callback:e,"expired-callback":n}=this.params;if(e)try{e(this.responseToken)}catch{}this.timerId=window.setTimeout(()=>{if(this.timerId=null,this.responseToken=null,n)try{n()}catch{}this.isVisible&&this.execute()},lo)},co))}checkIfDeleted(){if(this.deleted)throw new Error("reCAPTCHA mock was already deleted!")}}function mo(t){const e=[],n="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let r=0;r<t;r++)e.push(n.charAt(Math.floor(Math.random()*n.length)));return e.join("")}const go="recaptcha-enterprise",We="NO_RECAPTCHA",qn="onFirebaseAuthREInstanceReady";class G{constructor(e){this.type=go,this.auth=ue(e)}async verify(e="verify",n=!1){async function r(i){if(!n){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(a,o)=>{$r(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)o(new Error("recaptcha Enterprise site key undefined"));else{const l=new Fr(c);return i.tenantId==null?i._agentRecaptchaConfig=l:i._tenantRecaptchaConfigs[i.tenantId]=l,a(l.siteKey)}}).catch(c=>{o(c)})})}function s(i,a,o){const c=window.grecaptcha;$n(c)?c.enterprise.ready(()=>{c.enterprise.execute(i,{action:e}).then(l=>{a(l)}).catch(()=>{a(We)})}):o(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new ho().execute("siteKey",{action:"verify"}):new Promise((i,a)=>{r(this.auth).then(async o=>{if(!n&&$n(window.grecaptcha)&&G.scriptInjectionDeferred)await G.scriptInjectionDeferred.promise,s(o,i,a);else{if(typeof window>"u"){a(new Error("RecaptchaVerifier is only supported in browser"));return}let c=ao();c.length!==0&&(c+=o+`&onload=${qn}`),G.scriptInjectionDeferred=new Tr,window[qn]=()=>{G.scriptInjectionDeferred?.resolve()},dn(c).then(()=>G.scriptInjectionDeferred?.promise).then(()=>{s(o,i,a)}).catch(l=>{a(l)})}}).catch(o=>{a(o)})})}}G.scriptInjectionDeferred=null;async function Dt(t,e,n,r=!1,s=!1){const i=new G(t);let a;if(s)a=We;else try{a=await i.verify(n)}catch{a=await i.verify(n,!0)}const o={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in o){const c=o.phoneEnrollmentInfo.phoneNumber,l=o.phoneEnrollmentInfo.recaptchaToken;Object.assign(o,{phoneEnrollmentInfo:{phoneNumber:c,recaptchaToken:l,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in o){const c=o.phoneSignInInfo.recaptchaToken;Object.assign(o,{phoneSignInInfo:{recaptchaToken:c,captchaResponse:a,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return o}return r?Object.assign(o,{captchaResp:a}):Object.assign(o,{captchaResponse:a}),Object.assign(o,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(o,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),o}async function Lt(t,e,n,r,s){if(t._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER")){const i=await Dt(t,e,n);return r(t,i).catch(async a=>{if(t._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER")==="AUDIT"&&(a.code==="auth/missing-recaptcha-token"||a.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${n} flow.`);const o=await Dt(t,e,n,!1,!0);return r(t,o)}return Promise.reject(a)})}else{const i=await Dt(t,e,n,!1,!0);return r(t,i)}}async function yo(t){const e=ue(t),n=await $r(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),r=new Fr(n);e.tenantId==null?e._agentRecaptchaConfig=r:e._tenantRecaptchaConfigs[e.tenantId]=r,r.isAnyProviderEnabled()&&new G(e).verify()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Io(t,e){const n=Me(t,"auth");if(n.isInitialized()){const s=n.getImmediate(),i=n.getOptions();if(we(i,e??{}))return s;Q(s,"already-initialized")}return n.initialize({options:e})}function wo(t,e){const n=e?.persistence||[],r=(Array.isArray(n)?n:[n]).map(J);e?.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e?.popupRedirectResolver)}function bo(t,e,n){const r=ue(t);h(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,i=Zr(e),{host:a,port:o}=_o(e),c=o===null?"":`:${o}`,l={url:`${i}//${a}${c}/`},d=Object.freeze({host:a,port:o,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){h(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),h(we(l,r.config.emulator)&&we(d,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=l,r.emulatorConfig=d,r.settings.appVerificationDisabledForTesting=!0,nn(a)?Ti(`${i}//${a}${c}`):Eo()}function Zr(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function _o(t){const e=Zr(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:Gn(r.substr(i.length+1))}}else{const[i,a]=r.split(":");return{host:i,port:Gn(a)}}}function Gn(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function Eo(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hn{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return K("not implemented")}_getIdTokenResponse(e){return K("not implemented")}_linkToIdToken(e,n){return K("not implemented")}_getReauthenticationResolver(e){return K("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xe(t,e){return _t(t,"POST","/v1/accounts:signInWithIdp",z(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vo="http://localhost";class be extends hn{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new be(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Q("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s,...i}=n;if(!r||!s)return null;const a=new be(r,s);return a.idToken=i.idToken||void 0,a.accessToken=i.accessToken||void 0,a.secret=i.secret,a.nonce=i.nonce,a.pendingToken=i.pendingToken||null,a}_getIdTokenResponse(e){const n=this.buildRequest();return xe(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,xe(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,xe(e,n)}buildRequest(){const e={requestUri:vo,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Le(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Kn(t,e){return U(t,"POST","/v1/accounts:sendVerificationCode",z(t,e))}async function To(t,e){return _t(t,"POST","/v1/accounts:signInWithPhoneNumber",z(t,e))}async function So(t,e){const n=await _t(t,"POST","/v1/accounts:signInWithPhoneNumber",z(t,e));if(n.temporaryProof)throw Ve(t,"account-exists-with-different-credential",n);return n}const ko={USER_NOT_FOUND:"user-not-found"};async function Co(t,e){const n={...e,operation:"REAUTH"};return _t(t,"POST","/v1/accounts:signInWithPhoneNumber",z(t,n),ko)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ze extends hn{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,n){return new ze({verificationId:e,verificationCode:n})}static _fromTokenResponse(e,n){return new ze({phoneNumber:e,temporaryProof:n})}_getIdTokenResponse(e){return To(e,this._makeVerificationRequest())}_linkToIdToken(e,n){return So(e,{idToken:n,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return Co(e,this._makeVerificationRequest())}_makeVerificationRequest(){const{temporaryProof:e,phoneNumber:n,verificationId:r,verificationCode:s}=this.params;return e&&n?{temporaryProof:e,phoneNumber:n}:{sessionInfo:r,code:s}}toJSON(){const e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));const{verificationId:n,verificationCode:r,phoneNumber:s,temporaryProof:i}=e;return!r&&!n&&!s&&!i?null:new ze({verificationId:n,verificationCode:r,phoneNumber:s,temporaryProof:i})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class es{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class et extends es{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class re extends et{constructor(){super("facebook.com")}static credential(e){return be._fromParams({providerId:re.PROVIDER_ID,signInMethod:re.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return re.credentialFromTaggedObject(e)}static credentialFromError(e){return re.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return re.credential(e.oauthAccessToken)}catch{return null}}}re.FACEBOOK_SIGN_IN_METHOD="facebook.com";re.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class se extends et{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return be._fromParams({providerId:se.PROVIDER_ID,signInMethod:se.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return se.credentialFromTaggedObject(e)}static credentialFromError(e){return se.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return se.credential(n,r)}catch{return null}}}se.GOOGLE_SIGN_IN_METHOD="google.com";se.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ie extends et{constructor(){super("github.com")}static credential(e){return be._fromParams({providerId:ie.PROVIDER_ID,signInMethod:ie.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ie.credentialFromTaggedObject(e)}static credentialFromError(e){return ie.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ie.credential(e.oauthAccessToken)}catch{return null}}}ie.GITHUB_SIGN_IN_METHOD="github.com";ie.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ae extends et{constructor(){super("twitter.com")}static credential(e,n){return be._fromParams({providerId:ae.PROVIDER_ID,signInMethod:ae.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return ae.credentialFromTaggedObject(e)}static credentialFromError(e){return ae.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return ae.credential(n,r)}catch{return null}}}ae.TWITTER_SIGN_IN_METHOD="twitter.com";ae.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class De{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,s=!1){const i=await M._fromIdTokenResponse(e,r,s),a=Jn(r);return new De({user:i,providerId:a,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const s=Jn(r);return new De({user:e,providerId:s,_tokenResponse:r,operationType:n})}}function Jn(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gt extends H{constructor(e,n,r,s){super(n.code,n.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,gt.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,s){return new gt(e,n,r,s)}}function ts(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?gt._fromErrorAndOperation(t,i,e,r):i})}async function Ro(t,e,n=!1){const r=await Ye(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return De._forOperation(t,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ao(t,e,n=!1){const{auth:r}=t;if($(r.app))return Promise.reject(le(r));const s="reauthenticate";try{const i=await Ye(t,ts(r,s,e,t),n);h(i.idToken,r,"internal-error");const a=ln(i.idToken);h(a,r,"internal-error");const{sub:o}=a;return h(t.uid===o,r,"user-mismatch"),De._forOperation(t,s,i)}catch(i){throw i?.code==="auth/user-not-found"&&Q(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ns(t,e,n=!1){if($(t.app))return Promise.reject(le(t));const r="signIn",s=await ts(t,r,e),i=await De._fromIdTokenResponse(t,r,s);return n||await t._updateCurrentUser(i.user),i}async function Po(t,e){return ns(ue(t),e)}function No(t,e,n,r){return W(t).onIdTokenChanged(e,n,r)}function xo(t,e,n){return W(t).beforeAuthStateChanged(e,n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yn(t,e){return U(t,"POST","/v2/accounts/mfaEnrollment:start",z(t,e))}const yt="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rs{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(yt,"1"),this.storage.removeItem(yt),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oo=1e3,Do=10;class ss extends rs{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Yr(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),s=this.localCache[n];r!==s&&e(n,s,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((a,o,c)=>{this.notifyListeners(a,c)});return}const r=e.key;n?this.detachListener():this.stopPolling();const s=()=>{const a=this.storage.getItem(r);!n&&this.localCache[r]===a||this.notifyListeners(r,a)},i=this.storage.getItem(r);Qa()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,Do):s()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},Oo)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}ss.type="LOCAL";const Lo=ss;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class is extends rs{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}is.type="SESSION";const as=is;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mo(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Et{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(s=>s.isListeningto(e));if(n)return n;const r=new Et(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:s,data:i}=n.data,a=this.handlersMap[s];if(!a?.size)return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const o=Array.from(a).map(async l=>l(n.origin,i)),c=await Mo(o);n.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:c})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Et.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fn(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uo{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,a;return new Promise((o,c)=>{const l=fn("",20);s.port1.start();const d=setTimeout(()=>{c(new Error("unsupported_event"))},r);a={messageChannel:s,onMessage(p){const y=p;if(y.data.eventId===l)switch(y.data.status){case"ack":clearTimeout(d),i=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),o(y.data.response);break;default:clearTimeout(d),clearTimeout(i),c(new Error("invalid_response"));break}}},this.handlers.add(a),s.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:l,data:n},[s.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _(){return window}function jo(t){_().location.href=t}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pn(){return typeof _().WorkerGlobalScope<"u"&&typeof _().importScripts=="function"}async function Fo(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function $o(){return navigator?.serviceWorker?.controller||null}function Vo(){return pn()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const os="firebaseLocalStorageDb",Bo=1,It="firebaseLocalStorage",cs="fbase_key";class tt{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function vt(t,e){return t.transaction([It],e?"readwrite":"readonly").objectStore(It)}function Ho(){const t=indexedDB.deleteDatabase(os);return new tt(t).toPromise()}function ls(){const t=indexedDB.open(os,Bo);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(It,{keyPath:cs})}catch(s){n(s)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(It)?e(r):(r.close(),await Ho(),e(await ls()))})})}async function Xn(t,e,n){const r=vt(t,!0).put({[cs]:e,value:n});return new tt(r).toPromise()}async function Wo(t,e){const n=vt(t,!1).get(e),r=await new tt(n).toPromise();return r===void 0?null:r.value}function Qn(t,e){const n=vt(t,!0).delete(e);return new tt(n).toPromise()}const zo=800,qo=3;class us{constructor(){this.type="LOCAL",this.dbPromise=null,this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.dbPromise?this.dbPromise:(this.dbPromise=ls(),this.dbPromise.catch(()=>{this.dbPromise=null}),this.dbPromise)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>qo)throw r;this.dbPromise&&((await this.dbPromise).close(),this.dbPromise=null)}}async initializeServiceWorkerMessaging(){return pn()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Et._getInstance(Vo()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await Fo(),!this.activeServiceWorker)return;this.sender=new Uo(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||$o()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{return indexedDB?(await this._withRetries(async e=>{await Xn(e,yt,"1"),await Qn(e,yt)}),!0):!1}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>Xn(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>Wo(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>Qn(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=vt(s,!1).getAll();return new tt(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),n.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),n.push(s));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),zo)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}us.type="LOCAL";const Go=us;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zn(t,e){return U(t,"POST","/v2/accounts/mfaSignIn:start",z(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mt=Qr("rcb"),Ko=new Qe(3e4,6e4);class Jo{constructor(){this.hostLanguage="",this.counter=0,this.librarySeparatelyLoaded=!!_().grecaptcha?.render}load(e,n=""){return h(Yo(n),e,"argument-error"),this.shouldResolveImmediately(n)&&Fn(_().grecaptcha)?Promise.resolve(_().grecaptcha):new Promise((r,s)=>{const i=_().setTimeout(()=>{s(A(e,"network-request-failed"))},Ko.get());_()[Mt]=()=>{_().clearTimeout(i),delete _()[Mt];const o=_().grecaptcha;if(!o||!Fn(o)){s(A(e,"internal-error"));return}const c=o.render;o.render=(l,d)=>{const p=c(l,d);return this.counter++,p},this.hostLanguage=n,r(o)};const a=`${io()}?${Le({onload:Mt,render:"explicit",hl:n})}`;dn(a).catch(()=>{clearTimeout(i),s(A(e,"internal-error"))})})}clearedOneInstance(){this.counter--}shouldResolveImmediately(e){return!!_().grecaptcha?.render&&(e===this.hostLanguage||this.counter>0||this.librarySeparatelyLoaded)}}function Yo(t){return t.length<=6&&/^\s*[a-zA-Z0-9\-]*\s*$/.test(t)}class Xo{async load(e){return new uo(e)}clearedOneInstance(){}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qe="recaptcha",Qo={theme:"light",type:"image"};class Zo{constructor(e,n,r={...Qo}){this.parameters=r,this.type=qe,this.destroyed=!1,this.widgetId=null,this.tokenChangeListeners=new Set,this.renderPromise=null,this.recaptcha=null,this.auth=ue(e),this.isInvisible=this.parameters.size==="invisible",h(typeof document<"u",this.auth,"operation-not-supported-in-this-environment");const s=typeof n=="string"?document.getElementById(n):n;h(s,this.auth,"argument-error"),this.container=s,this.parameters.callback=this.makeTokenCallback(this.parameters.callback),this._recaptchaLoader=this.auth.settings.appVerificationDisabledForTesting?new Xo:new Jo,this.validateStartingState()}async verify(){this.assertNotDestroyed();const e=await this.render(),n=this.getAssertedRecaptcha(),r=n.getResponse(e);return r||new Promise(s=>{const i=a=>{a&&(this.tokenChangeListeners.delete(i),s(a))};this.tokenChangeListeners.add(i),this.isInvisible&&n.execute(e)})}render(){try{this.assertNotDestroyed()}catch(e){return Promise.reject(e)}return this.renderPromise?this.renderPromise:(this.renderPromise=this.makeRenderPromise().catch(e=>{throw this.renderPromise=null,e}),this.renderPromise)}_reset(){this.assertNotDestroyed(),this.widgetId!==null&&this.getAssertedRecaptcha().reset(this.widgetId)}clear(){this.assertNotDestroyed(),this.destroyed=!0,this._recaptchaLoader.clearedOneInstance(),this.isInvisible||this.container.childNodes.forEach(e=>{this.container.removeChild(e)})}validateStartingState(){h(!this.parameters.sitekey,this.auth,"argument-error"),h(this.isInvisible||!this.container.hasChildNodes(),this.auth,"argument-error"),h(typeof document<"u",this.auth,"operation-not-supported-in-this-environment")}makeTokenCallback(e){return n=>{if(this.tokenChangeListeners.forEach(r=>r(n)),typeof e=="function")e(n);else if(typeof e=="string"){const r=_()[e];typeof r=="function"&&r(n)}}}assertNotDestroyed(){h(!this.destroyed,this.auth,"internal-error")}async makeRenderPromise(){if(await this.init(),!this.widgetId){let e=this.container;if(!this.isInvisible){const n=document.createElement("div");e.appendChild(n),e=n}this.widgetId=this.getAssertedRecaptcha().render(e,this.parameters)}return this.widgetId}async init(){h(Lr()&&!pn(),this.auth,"internal-error"),await ec(),this.recaptcha=await this._recaptchaLoader.load(this.auth,this.auth.languageCode||void 0);const e=await Ba(this.auth);h(e,this.auth,"internal-error"),this.parameters.sitekey=e}getAssertedRecaptcha(){return h(this.recaptcha,this.auth,"internal-error"),this.recaptcha}}function ec(){let t=null;return new Promise(e=>{if(document.readyState==="complete"){e();return}t=()=>e(),window.addEventListener("load",t)}).catch(e=>{throw t&&window.removeEventListener("load",t),e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tc{constructor(e,n){this.verificationId=e,this.onConfirmation=n}confirm(e){const n=ze._fromVerification(this.verificationId,e);return this.onConfirmation(n)}}async function nc(t,e,n){if($(t.app))return Promise.reject(le(t));const r=ue(t),s=await rc(r,e,W(n));return new tc(s,i=>Po(r,i))}async function rc(t,e,n){if(!t._getRecaptchaConfig())try{await yo(t)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let r;if(typeof e=="string"?r={phoneNumber:e}:r=e,"session"in r){const s=r.session;if("phoneNumber"in r){h(s.type==="enroll",t,"internal-error");const i={idToken:s.credential,phoneEnrollmentInfo:{phoneNumber:r.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await Lt(t,i,"mfaSmsEnrollment",async(l,d)=>{if(d.phoneEnrollmentInfo.captchaResponse===We){h(n?.type===qe,l,"argument-error");const p=await Ut(l,d,n);return Yn(l,p)}return Yn(l,d)},"PHONE_PROVIDER").catch(l=>Promise.reject(l))).phoneSessionInfo.sessionInfo}else{h(s.type==="signin",t,"internal-error");const i=r.multiFactorHint?.uid||r.multiFactorUid;h(i,t,"missing-multi-factor-info");const a={mfaPendingCredential:s.credential,mfaEnrollmentId:i,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await Lt(t,a,"mfaSmsSignIn",async(d,p)=>{if(p.phoneSignInInfo.captchaResponse===We){h(n?.type===qe,d,"argument-error");const y=await Ut(d,p,n);return Zn(d,y)}return Zn(d,p)},"PHONE_PROVIDER").catch(d=>Promise.reject(d))).phoneResponseInfo.sessionInfo}}else{const s={phoneNumber:r.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await Lt(t,s,"sendVerificationCode",async(c,l)=>{if(l.captchaResponse===We){h(n?.type===qe,c,"argument-error");const d=await Ut(c,l,n);return Kn(c,d)}return Kn(c,l)},"PHONE_PROVIDER").catch(c=>Promise.reject(c))).sessionInfo}}finally{n?._reset()}}async function Ut(t,e,n){h(n.type===qe,t,"argument-error");const r=await n.verify();h(typeof r=="string",t,"argument-error");const s={...e};if("phoneEnrollmentInfo"in s){const i=s.phoneEnrollmentInfo.phoneNumber,a=s.phoneEnrollmentInfo.captchaResponse,o=s.phoneEnrollmentInfo.clientType,c=s.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(s,{phoneEnrollmentInfo:{phoneNumber:i,recaptchaToken:r,captchaResponse:a,clientType:o,recaptchaVersion:c}}),s}else if("phoneSignInInfo"in s){const i=s.phoneSignInInfo.captchaResponse,a=s.phoneSignInInfo.clientType,o=s.phoneSignInInfo.recaptchaVersion;return Object.assign(s,{phoneSignInInfo:{recaptchaToken:r,captchaResponse:i,clientType:a,recaptchaVersion:o}}),s}else return Object.assign(s,{recaptchaToken:r}),s}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sc(t,e){return e?J(e):(h(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mn extends hn{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return xe(e,this._buildIdpRequest())}_linkToIdToken(e,n){return xe(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return xe(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function ic(t){return ns(t.auth,new mn(t),t.bypassAuthState)}function ac(t){const{auth:e,user:n}=t;return h(n,e,"internal-error"),Ao(n,new mn(t),t.bypassAuthState)}async function oc(t){const{auth:e,user:n}=t;return h(n,e,"internal-error"),Ro(n,new mn(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ds{constructor(e,n,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:s,tenantId:i,error:a,type:o}=e;if(a){this.reject(a);return}const c={auth:this.auth,requestUri:n,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(o)(c))}catch(l){this.reject(l)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return ic;case"linkViaPopup":case"linkViaRedirect":return oc;case"reauthViaPopup":case"reauthViaRedirect":return ac;default:Q(this.auth,"internal-error")}}resolve(e){Z(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Z(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cc=new Qe(2e3,1e4);class Ae extends ds{constructor(e,n,r,s,i){super(e,n,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Ae.currentPopupAction&&Ae.currentPopupAction.cancel(),Ae.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return h(e,this.auth,"internal-error"),e}async onExecution(){Z(this.filter.length===1,"Popup operations only handle one event");const e=fn();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(A(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(A(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Ae.currentPopupAction=null}pollUserCancellation(){const e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(A(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,cc.get())};e()}}Ae.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lc="pendingRedirect",lt=new Map;class uc extends ds{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=lt.get(this.auth._key());if(!e){try{const r=await dc(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}lt.set(this.auth._key(),e)}return this.bypassAuthState||lt.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function dc(t,e){const n=pc(e),r=fc(t);if(!await r._isAvailable())return!1;const s=await r._get(n)==="true";return await r._remove(n),s}function hc(t,e){lt.set(t._key(),e)}function fc(t){return J(t._redirectPersistence)}function pc(t){return ct(lc,t.config.apiKey,t.name)}async function mc(t,e,n=!1){if($(t.app))return Promise.reject(le(t));const r=ue(t),s=sc(r,e),a=await new uc(r,s,n).execute();return a&&!n&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gc=600*1e3;class yc{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Ic(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){if(e.error&&!hs(e)){const r=e.error.code?.split("auth/")[1]||"internal-error";n.onError(A(this.auth,r))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=gc&&this.cachedEventUids.clear(),this.cachedEventUids.has(er(e))}saveEventToCache(e){this.cachedEventUids.add(er(e)),this.lastProcessedEventTime=Date.now()}}function er(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function hs({type:t,error:e}){return t==="unknown"&&e?.code==="auth/no-auth-event"}function Ic(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return hs(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wc(t,e={}){return U(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bc=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,_c=/^https?/;async function Ec(t){if(t.config.emulator)return;const{authorizedDomains:e}=await wc(t);for(const n of e)try{if(vc(n))return}catch{}Q(t,"unauthorized-domain")}function vc(t){const e=Gt(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const a=new URL(t);return a.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&a.hostname===r}if(!_c.test(n))return!1;if(bc.test(t))return r===t;const s=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tc=new Qe(3e4,6e4);function tr(){const t=_().___jsl;if(t?.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function Sc(t){return new Promise((e,n)=>{function r(){tr(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{tr(),n(A(t,"network-request-failed"))},timeout:Tc.get()})}if(_().gapi?.iframes?.Iframe)e(gapi.iframes.getContext());else if(_().gapi?.load)r();else{const s=Qr("iframefcb");return _()[s]=()=>{gapi.load?r():n(A(t,"network-request-failed"))},dn(`${oo()}?onload=${s}`).catch(i=>n(i))}}).catch(e=>{throw ut=null,e})}let ut=null;function kc(t){return ut=ut||Sc(t),ut}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Cc=new Qe(5e3,15e3),Rc="__/auth/iframe",Ac="emulator/auth/iframe",Pc={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Nc=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function xc(t){const e=t.config;h(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?cn(e,Ac):`https://${t.config.authDomain}/${Rc}`,r={apiKey:e.apiKey,appName:t.name,v:Xe},s=Nc.get(t.config.apiHost);s&&(r.eid=s);const i=t._getFrameworks();return i.length&&(r.fw=i.join(",")),`${n}?${Le(r).slice(1)}`}async function Oc(t){const e=await kc(t),n=_().gapi;return h(n,t,"internal-error"),e.open({where:document.body,url:xc(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Pc,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const a=A(t,"network-request-failed"),o=_().setTimeout(()=>{i(a)},Cc.get());function c(){_().clearTimeout(o),s(r)}r.ping(c).then(c,()=>{i(a)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dc={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Lc=500,Mc=600,Uc="_blank",jc="http://localhost";class nr{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Fc(t,e,n,r=Lc,s=Mc){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let o="";const c={...Dc,width:r.toString(),height:s.toString(),top:i,left:a},l=S().toLowerCase();n&&(o=zr(l)?Uc:n),Hr(l)&&(e=e||jc,c.scrollbars="yes");const d=Object.entries(c).reduce((y,[w,C])=>`${y}${w}=${C},`,"");if(Xa(l)&&o!=="_self")return $c(e||"",o),new nr(null);const p=window.open(e||"",o,d);h(p,t,"popup-blocked");try{p.focus()}catch{}return new nr(p)}function $c(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vc="__/auth/handler",Bc="emulator/auth/handler",Hc=encodeURIComponent("fac");async function rr(t,e,n,r,s,i){h(t.config.authDomain,t,"auth-domain-config-required"),h(t.config.apiKey,t,"invalid-api-key");const a={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:Xe,eventId:s};if(e instanceof es){e.setDefaultLanguage(t.languageCode),a.providerId=e.providerId||"",gi(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,p]of Object.entries({}))a[d]=p}if(e instanceof et){const d=e.getScopes().filter(p=>p!=="");d.length>0&&(a.scopes=d.join(","))}t.tenantId&&(a.tid=t.tenantId);const o=a;for(const d of Object.keys(o))o[d]===void 0&&delete o[d];const c=await t._getAppCheckToken(),l=c?`#${Hc}=${encodeURIComponent(c)}`:"";return`${Wc(t)}?${Le(o).slice(1)}${l}`}function Wc({config:t}){return t.emulator?cn(t,Bc):`https://${t.authDomain}/${Vc}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jt="webStorageSupport";class zc{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=as,this._completeRedirectFn=mc,this._overrideRedirectResult=hc}async _openPopup(e,n,r,s){Z(this.eventManagers[e._key()]?.manager,"_initialize() not called before _openPopup()");const i=await rr(e,n,r,Gt(),s);return Fc(e,i,fn())}async _openRedirect(e,n,r,s){await this._originValidation(e);const i=await rr(e,n,r,Gt(),s);return jo(i),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:s,promise:i}=this.eventManagers[n];return s?Promise.resolve(s):(Z(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await Oc(e),r=new yc(e);return n.register("authEvent",s=>(h(s?.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(jt,{type:jt},s=>{const i=s?.[0]?.[jt];i!==void 0&&n(!!i),Q(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=Ec(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return Yr()||Wr()||un()}}const qc=zc;var sr="@firebase/auth",ir="1.13.3";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gc{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e(r?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){h(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kc(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Jc(t){X(new B("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:a,authDomain:o}=r.options;h(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:a,authDomain:o,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Xr(t)},l=new ro(r,s,i,c);return wo(l,n),l},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),X(new B("auth-internal",e=>{const n=ue(e.getProvider("auth").getImmediate());return(r=>new Gc(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),V(sr,ir,Kc(t)),V(sr,ir,"esm2020")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yc=300,Xc=vr("authIdTokenMaxAge")||Yc;let ar=null;const Qc=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>Xc)return;const s=n?.token;ar!==s&&(ar=s,await fetch(t,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function Zc(t=an()){const e=Me(t,"auth");if(e.isInitialized())return e.getImmediate();const n=Io(t,{popupRedirectResolver:qc,persistence:[Go,Lo,as]}),r=vr("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const a=Qc(i.toString());xo(n,a,()=>a(n.currentUser)),No(n,o=>a(o))}}const s=ci("auth");return s&&bo(n,`http://${s}`),n}function el(){return document.getElementsByTagName("head")?.[0]??document}so({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=s=>{const i=A("internal-error");i.customData=s,n(i)},r.type="text/javascript",r.charset="UTF-8",el().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Jc("Browser");var tl="firebase",nl="12.15.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */V(tl,nl,"app");const fs="@firebase/installations",gn="0.6.22";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ps=1e4,ms=`w:${gn}`,gs="FIS_v2",rl="https://firebaseinstallations.googleapis.com/v1",sl=3600*1e3,il="installations",al="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ol={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},_e=new ve(il,al,ol);function ys(t){return t instanceof H&&t.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Is({projectId:t}){return`${rl}/projects/${t}/installations`}function ws(t){return{token:t.token,requestStatus:2,expiresIn:ll(t.expiresIn),creationTime:Date.now()}}async function bs(t,e){const r=(await e.json()).error;return _e.create("request-failed",{requestName:t,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function _s({apiKey:t}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":t})}function cl(t,{refreshToken:e}){const n=_s(t);return n.append("Authorization",ul(e)),n}async function Es(t){const e=await t();return e.status>=500&&e.status<600?t():e}function ll(t){return Number(t.replace("s","000"))}function ul(t){return`${gs} ${t}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function dl({appConfig:t,heartbeatServiceProvider:e},{fid:n}){const r=Is(t),s=_s(t),i=e.getImmediate({optional:!0});if(i){const l=await i.getHeartbeatsHeader();l&&s.append("x-firebase-client",l)}const a={fid:n,authVersion:gs,appId:t.appId,sdkVersion:ms},o={method:"POST",headers:s,body:JSON.stringify(a)},c=await Es(()=>fetch(r,o));if(c.ok){const l=await c.json();return{fid:l.fid||n,registrationStatus:2,refreshToken:l.refreshToken,authToken:ws(l.authToken)}}else throw await bs("Create Installation",c)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vs(t){return new Promise(e=>{setTimeout(e,t)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hl(t){return btoa(String.fromCharCode(...t)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fl=/^[cdef][\w-]{21}$/,Jt="";function pl(){try{const t=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(t),t[0]=112+t[0]%16;const n=ml(t);return fl.test(n)?n:Jt}catch{return Jt}}function ml(t){return hl(t).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tt(t){return`${t.appName}!${t.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ts=new Map;function Ss(t,e){const n=Tt(t);ks(n,e),gl(n,e)}function ks(t,e){const n=Ts.get(t);if(n)for(const r of n)r(e)}function gl(t,e){const n=yl();n&&n.postMessage({key:t,fid:e}),Il()}let Ie=null;function yl(){return!Ie&&"BroadcastChannel"in self&&(Ie=new BroadcastChannel("[Firebase] FID Change"),Ie.onmessage=t=>{ks(t.data.key,t.data.fid)}),Ie}function Il(){Ts.size===0&&Ie&&(Ie.close(),Ie=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wl="firebase-installations-database",bl=1,Ee="firebase-installations-store";let Ft=null;function yn(){return Ft||(Ft=Rr(wl,bl,{upgrade:(t,e)=>{switch(e){case 0:t.createObjectStore(Ee)}}})),Ft}async function wt(t,e){const n=Tt(t),s=(await yn()).transaction(Ee,"readwrite"),i=s.objectStore(Ee),a=await i.get(n);return await i.put(e,n),await s.done,(!a||a.fid!==e.fid)&&Ss(t,e.fid),e}async function Cs(t){const e=Tt(t),r=(await yn()).transaction(Ee,"readwrite");await r.objectStore(Ee).delete(e),await r.done}async function St(t,e){const n=Tt(t),s=(await yn()).transaction(Ee,"readwrite"),i=s.objectStore(Ee),a=await i.get(n),o=e(a);return o===void 0?await i.delete(n):await i.put(o,n),await s.done,o&&(!a||a.fid!==o.fid)&&Ss(t,o.fid),o}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function In(t){let e;const n=await St(t.appConfig,r=>{const s=_l(r),i=El(t,s);return e=i.registrationPromise,i.installationEntry});return n.fid===Jt?{installationEntry:await e}:{installationEntry:n,registrationPromise:e}}function _l(t){const e=t||{fid:pl(),registrationStatus:0};return Rs(e)}function El(t,e){if(e.registrationStatus===0){if(!navigator.onLine){const s=Promise.reject(_e.create("app-offline"));return{installationEntry:e,registrationPromise:s}}const n={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},r=vl(t,n);return{installationEntry:n,registrationPromise:r}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:Tl(t)}:{installationEntry:e}}async function vl(t,e){try{const n=await dl(t,e);return wt(t.appConfig,n)}catch(n){throw ys(n)&&n.customData.serverCode===409?await Cs(t.appConfig):await wt(t.appConfig,{fid:e.fid,registrationStatus:0}),n}}async function Tl(t){let e=await or(t.appConfig);for(;e.registrationStatus===1;)await vs(100),e=await or(t.appConfig);if(e.registrationStatus===0){const{installationEntry:n,registrationPromise:r}=await In(t);return r||n}return e}function or(t){return St(t,e=>{if(!e)throw _e.create("installation-not-found");return Rs(e)})}function Rs(t){return Sl(t)?{fid:t.fid,registrationStatus:0}:t}function Sl(t){return t.registrationStatus===1&&t.registrationTime+ps<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function kl({appConfig:t,heartbeatServiceProvider:e},n){const r=Cl(t,n),s=cl(t,n),i=e.getImmediate({optional:!0});if(i){const l=await i.getHeartbeatsHeader();l&&s.append("x-firebase-client",l)}const a={installation:{sdkVersion:ms,appId:t.appId}},o={method:"POST",headers:s,body:JSON.stringify(a)},c=await Es(()=>fetch(r,o));if(c.ok){const l=await c.json();return ws(l)}else throw await bs("Generate Auth Token",c)}function Cl(t,{fid:e}){return`${Is(t)}/${e}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wn(t,e=!1){let n;const r=await St(t.appConfig,i=>{if(!As(i))throw _e.create("not-registered");const a=i.authToken;if(!e&&Pl(a))return i;if(a.requestStatus===1)return n=Rl(t,e),i;{if(!navigator.onLine)throw _e.create("app-offline");const o=xl(i);return n=Al(t,o),o}});return n?await n:r.authToken}async function Rl(t,e){let n=await cr(t.appConfig);for(;n.authToken.requestStatus===1;)await vs(100),n=await cr(t.appConfig);const r=n.authToken;return r.requestStatus===0?wn(t,e):r}function cr(t){return St(t,e=>{if(!As(e))throw _e.create("not-registered");const n=e.authToken;return Ol(n)?{...e,authToken:{requestStatus:0}}:e})}async function Al(t,e){try{const n=await kl(t,e),r={...e,authToken:n};return await wt(t.appConfig,r),n}catch(n){if(ys(n)&&(n.customData.serverCode===401||n.customData.serverCode===404))await Cs(t.appConfig);else{const r={...e,authToken:{requestStatus:0}};await wt(t.appConfig,r)}throw n}}function As(t){return t!==void 0&&t.registrationStatus===2}function Pl(t){return t.requestStatus===2&&!Nl(t)}function Nl(t){const e=Date.now();return e<t.creationTime||t.creationTime+t.expiresIn<e+sl}function xl(t){const e={requestStatus:1,requestTime:Date.now()};return{...t,authToken:e}}function Ol(t){return t.requestStatus===1&&t.requestTime+ps<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Dl(t){const e=t,{installationEntry:n,registrationPromise:r}=await In(e);return r?r.catch(console.error):wn(e).catch(console.error),n.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ll(t,e=!1){const n=t;return await Ml(n),(await wn(n,e)).token}async function Ml(t){const{registrationPromise:e}=await In(t);e&&await e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ul(t){if(!t||!t.options)throw $t("App Configuration");if(!t.name)throw $t("App Name");const e=["projectId","apiKey","appId"];for(const n of e)if(!t.options[n])throw $t(n);return{appName:t.name,projectId:t.options.projectId,apiKey:t.options.apiKey,appId:t.options.appId}}function $t(t){return _e.create("missing-app-config-values",{valueName:t})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ps="installations",jl="installations-internal",Fl=t=>{const e=t.getProvider("app").getImmediate(),n=Ul(e),r=Me(e,"heartbeat");return{app:e,appConfig:n,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},$l=t=>{const e=t.getProvider("app").getImmediate(),n=Me(e,Ps).getImmediate();return{getId:()=>Dl(n),getToken:s=>Ll(n,s)}};function Vl(){X(new B(Ps,Fl,"PUBLIC")),X(new B(jl,$l,"PRIVATE"))}Vl();V(fs,gn);V(fs,gn,"esm2020");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bt="analytics",Bl="firebase_id",Hl="origin",Wl=60*1e3,zl="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",bn="https://www.googletagmanager.com/gtag/js";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const T=new rn("@firebase/analytics");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ql={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},P=new ve("analytics","Analytics",ql);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gl(t){if(!t.startsWith(bn)){const e=P.create("invalid-gtag-resource",{gtagURL:t});return T.warn(e.message),""}return t}function Ns(t){return Promise.all(t.map(e=>e.catch(n=>n)))}function Kl(t,e){let n;return window.trustedTypes&&(n=window.trustedTypes.createPolicy(t,e)),n}function Jl(t,e){const n=Kl("firebase-js-sdk-policy",{createScriptURL:Gl}),r=document.createElement("script"),s=`${bn}?l=${t}&id=${e}`;r.src=n?n?.createScriptURL(s):s,r.async=!0,document.head.appendChild(r)}function Yl(t){let e=[];return Array.isArray(window[t])?e=window[t]:window[t]=e,e}async function Xl(t,e,n,r,s,i){const a=r[s];try{if(a)await e[a];else{const c=(await Ns(n)).find(l=>l.measurementId===s);c&&await e[c.appId]}}catch(o){T.error(o)}t("config",s,i)}async function Ql(t,e,n,r,s){try{let i=[];if(s&&s.send_to){let a=s.send_to;Array.isArray(a)||(a=[a]);const o=await Ns(n);for(const c of a){const l=o.find(p=>p.measurementId===c),d=l&&e[l.appId];if(d)i.push(d);else{i=[];break}}}i.length===0&&(i=Object.values(e)),await Promise.all(i),t("event",r,s||{})}catch(i){T.error(i)}}function Zl(t,e,n,r){async function s(i,...a){try{if(i==="event"){const[o,c]=a;await Ql(t,e,n,o,c)}else if(i==="config"){const[o,c]=a;await Xl(t,e,n,r,o,c)}else if(i==="consent"){const[o,c]=a;t("consent",o,c)}else if(i==="get"){const[o,c,l]=a;t("get",o,c,l)}else if(i==="set"){const[o]=a;t("set",o)}else t(i,...a)}catch(o){T.error(o)}}return s}function eu(t,e,n,r,s){let i=function(...a){window[r].push(arguments)};return window[s]&&typeof window[s]=="function"&&(i=window[s]),window[s]=Zl(i,t,e,n),{gtagCore:i,wrappedGtag:window[s]}}function tu(t){const e=window.document.getElementsByTagName("script");for(const n of Object.values(e))if(n.src&&n.src.includes(bn)&&n.src.includes(t))return n;return null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nu=30,ru=1e3;class su{constructor(e={},n=ru){this.throttleMetadata=e,this.intervalMillis=n}getThrottleMetadata(e){return this.throttleMetadata[e]}setThrottleMetadata(e,n){this.throttleMetadata[e]=n}deleteThrottleMetadata(e){delete this.throttleMetadata[e]}}const xs=new su;function iu(t){return new Headers({Accept:"application/json","x-goog-api-key":t})}async function au(t){const{appId:e,apiKey:n}=t,r={method:"GET",headers:iu(n)},s=zl.replace("{app-id}",e),i=await fetch(s,r);if(i.status!==200&&i.status!==304){let a="";try{const o=await i.json();o.error?.message&&(a=o.error.message)}catch{}throw P.create("config-fetch-failed",{httpStatus:i.status,responseMessage:a})}return i.json()}async function ou(t,e=xs,n){const{appId:r,apiKey:s,measurementId:i}=t.options;if(!r)throw P.create("no-app-id");if(!s){if(i)return{measurementId:i,appId:r};throw P.create("no-api-key")}const a=e.getThrottleMetadata(r)||{backoffCount:0,throttleEndTimeMillis:Date.now()},o=new uu;return setTimeout(async()=>{o.abort()},Wl),Os({appId:r,apiKey:s,measurementId:i},a,o,e)}async function Os(t,{throttleEndTimeMillis:e,backoffCount:n},r,s=xs){const{appId:i,measurementId:a}=t;try{await cu(r,e)}catch(o){if(a)return T.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${a} provided in the "measurementId" field in the local Firebase config. [${o?.message}]`),{appId:i,measurementId:a};throw o}try{const o=await au(t);return s.deleteThrottleMetadata(i),o}catch(o){const c=o;if(!lu(c)){if(s.deleteThrottleMetadata(i),a)return T.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${a} provided in the "measurementId" field in the local Firebase config. [${c?.message}]`),{appId:i,measurementId:a};throw o}const l=Number(c?.customData?.httpStatus)===503?An(n,s.intervalMillis,nu):An(n,s.intervalMillis),d={throttleEndTimeMillis:Date.now()+l,backoffCount:n+1};return s.setThrottleMetadata(i,d),T.debug(`Calling attemptFetch again in ${l} millis`),Os(t,d,r,s)}}function cu(t,e){return new Promise((n,r)=>{const s=Math.max(e-Date.now(),0),i=setTimeout(n,s);t.addEventListener(()=>{clearTimeout(i),r(P.create("fetch-throttle",{throttleEndTimeMillis:e}))})})}function lu(t){if(!(t instanceof H)||!t.customData)return!1;const e=Number(t.customData.httpStatus);return e===429||e===500||e===503||e===504}class uu{constructor(){this.listeners=[]}addEventListener(e){this.listeners.push(e)}abort(){this.listeners.forEach(e=>e())}}async function du(t,e,n,r,s){if(s&&s.global){t("event",n,r);return}else{const i=await e,a={...r,send_to:i};t("event",n,a)}}async function hu(t,e,n,r){if(r&&r.global){const s={};for(const i of Object.keys(n))s[`user_properties.${i}`]=n[i];return t("set",s),Promise.resolve()}else{const s=await e;t("config",s,{update:!0,user_properties:n})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fu(){if(en())try{await tn()}catch(t){return T.warn(P.create("indexeddb-unavailable",{errorInfo:t?.toString()}).message),!1}else return T.warn(P.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function pu(t,e,n,r,s,i,a){const o=ou(t);o.then(y=>{n[y.measurementId]=y.appId,t.options.measurementId&&y.measurementId!==t.options.measurementId&&T.warn(`The measurement ID in the local Firebase config (${t.options.measurementId}) does not match the measurement ID fetched from the server (${y.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(y=>T.error(y)),e.push(o);const c=fu().then(y=>{if(y)return r.getId()}),[l,d]=await Promise.all([o,c]);tu(i)||Jl(i,l.measurementId),s("js",new Date);const p=a?.config??{};return p[Hl]="firebase",p.update=!0,d!=null&&(p[Bl]=d),s("config",l.measurementId,p),l.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mu{constructor(e){this.app=e}_delete(){return delete Oe[this.app.options.appId],Promise.resolve()}}let Oe={},lr=[];const ur={};let Vt="dataLayer",gu="gtag",dr,_n,hr=!1;function yu(){const t=[];if(Zt()&&t.push("This is a browser extension environment."),Sr()||t.push("Cookies are not available."),t.length>0){const e=t.map((r,s)=>`(${s+1}) ${r}`).join(" "),n=P.create("invalid-analytics-context",{errorInfo:e});T.warn(n.message)}}function Iu(t,e,n){yu();const r=t.options.appId;if(!r)throw P.create("no-app-id");if(!t.options.apiKey)if(t.options.measurementId)T.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${t.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw P.create("no-api-key");if(Oe[r]!=null)throw P.create("already-exists",{id:r});if(!hr){Yl(Vt);const{wrappedGtag:i,gtagCore:a}=eu(Oe,lr,ur,Vt,gu);_n=i,dr=a,hr=!0}return Oe[r]=pu(t,lr,ur,e,dr,Vt,n),new mu(t)}function wu(t=an()){t=W(t);const e=Me(t,bt);return e.isInitialized()?e.getImmediate():bu(t)}function bu(t,e={}){const n=Me(t,bt);if(n.isInitialized()){const s=n.getImmediate();if(we(e,n.getOptions()))return s;throw P.create("already-initialized")}return n.initialize({options:e})}async function _u(){if(Zt()||!Sr()||!en())return!1;try{return await tn()}catch{return!1}}function Eu(t,e,n){t=W(t),hu(_n,Oe[t.app.options.appId],e,n).catch(r=>T.error(r))}function vu(t,e,n,r){t=W(t),du(_n,Oe[t.app.options.appId],e,n,r).catch(s=>T.error(s))}const fr="@firebase/analytics",pr="0.10.22";function Tu(){X(new B(bt,(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("installations-internal").getImmediate();return Iu(r,s,n)},"PUBLIC")),X(new B("analytics-internal",t,"PRIVATE")),V(fr,pr),V(fr,pr,"esm2020");function t(e){try{const n=e.getProvider(bt).getImmediate();return{logEvent:(r,s,i)=>vu(n,r,s,i),setUserProperties:(r,s)=>Eu(n,r,s)}}catch(n){throw P.create("interop-component-reg-failed",{reason:n})}}}Tu();const Ge={apiKey:"AIzaSyBFVKx_vKNARhKC2afpzboUPOqLkrX5VUQ",authDomain:"lost-9b049.firebaseapp.com",projectId:"lost-9b049",storageBucket:"lost-9b049.firebasestorage.app",messagingSenderId:"839051962777",appId:"1:839051962777:web:63e2beea13d6af55a6cb08",measurementId:"G-G61ZLDYCTR"},Yt=!!(Ge.apiKey&&Ge.projectId&&Ge.appId),Ds=Ea().length?an():Ar(Ge),Xt=Zc(Ds);try{Xt.useDeviceLanguage()}catch{}let Su=null;typeof window<"u"&&Yt&&Ge.measurementId&&_u().then(t=>{if(t)try{Su=wu(Ds)}catch{}}).catch(()=>{});function ku(t){const e=String(t||"").replace(/[\s\-().]/g,"");if(!e)return{ok:!1,e164:"",local:"",error:"Phone number is required."};let n="";if(/^0(1[0125]\d{8})$/.test(e))n=e;else if(/^\+?20(1[0125]\d{8})$/.test(e))n="0"+e.replace(/^\+?20/,"");else if(/^0020(1[0125]\d{8})$/.test(e))n="0"+e.replace(/^0020/,"");else return{ok:!1,e164:"",local:"",error:"Enter a valid Egyptian mobile number (e.g. 01012345678)."};return{ok:!0,e164:"+20"+n.slice(1),local:n}}const Cu=60,Ru=5;function mr(t){switch(t&&t.code||""){case"auth/invalid-phone-number":return"That phone number is invalid. Please check it and try again.";case"auth/too-many-requests":return"Too many attempts from this device. Please wait a while and try again.";case"auth/invalid-verification-code":return"The code you entered is incorrect. Please try again.";case"auth/code-expired":return"This code has expired. Please request a new one.";case"auth/network-request-failed":return"Network error. Check your connection and try again.";case"auth/invalid-app-credential":case"auth/captcha-check-failed":return"reCAPTCHA verification failed. This usually means the current domain isn’t in Firebase Authorized Domains, the API key is restricted, or a test number is needed. (See setup notes.)";case"auth/missing-phone-number":return"Please enter your phone number.";case"auth/quota-exceeded":return"SMS quota exceeded. Please try again later.";default:return t&&t.message?t.message.replace("Firebase: ",""):"Something went wrong. Please try again."}}function Fu({defaultPhone:t="",onPhoneChange:e,onVerified:n,compact:r=!1}){const[s,i]=g.useState(t||""),[a,o]=g.useState(""),[c,l]=g.useState("idle"),[d,p]=g.useState(!1),[y,w]=g.useState(""),[C,k]=g.useState(""),[N,j]=g.useState(0),[de,Te]=g.useState(0),nt=g.useRef(null),ee=g.useRef(null),Se=g.useRef(null),D=g.useRef(null),E=ku(s);g.useEffect(()=>{e&&e(E.ok?E.e164:s,E.ok)},[s]);const te=()=>{D.current&&(window.clearInterval(D.current),D.current=null)},Ue=g.useCallback(()=>{te(),j(Cu),D.current=window.setInterval(()=>{j(v=>v<=1?(te(),0):v-1)},1e3)},[]),q=()=>{if(ee.current){try{ee.current.clear()}catch{}ee.current=null}},je=()=>(q(),ee.current=new Zo(Xt,nt.current,{size:"invisible",callback:()=>{},"expired-callback":()=>q()}),ee.current);g.useEffect(()=>()=>{te(),q()},[]);const Fe=async()=>{if(w(""),k(""),!E.ok){w(E.error||"Please enter a valid Egyptian phone number.");return}if(!Yt){w("Phone verification is not configured on this site yet.");return}p(!0);try{const v=je(),x=await nc(Xt,E.e164,v);Se.current=x,Te(0),l("codeSent"),k(`A 6-digit code was sent to ${E.e164}.`),Ue()}catch(v){w(mr(v)),q()}finally{p(!1)}},L=async()=>{if(w(""),!Se.current){w("Please request a code first.");return}if(de>=Ru){w("Too many incorrect attempts. Please resend a new code.");return}const v=a.trim();if(!/^\d{6}$/.test(v)){w("Enter the 6-digit code from the SMS.");return}p(!0);try{const x=await Se.current.confirm(v),F=x&&x.user&&x.user.phoneNumber||E.e164;te(),l("verified"),k("Phone verified successfully."),n&&n({phone:F,phoneVerified:!0,verifiedAt:new Date().toISOString()})}catch(x){Te(F=>F+1),w(mr(x))}finally{p(!1)}},he=()=>{Se.current=null,q(),te(),j(0),o(""),Te(0),w(""),k(""),l("idle")};if(c==="verified")return u.jsx("div",{className:r?"":"space-y-1",children:u.jsxs("div",{className:"flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 animate-fade-in",role:"status",children:[u.jsx(Be,{className:"w-5 h-5 text-emerald-600 flex-none","aria-hidden":"true"}),u.jsx("span",{className:"text-sm font-semibold text-emerald-700",children:"✅ Phone Verified Successfully"}),u.jsx("span",{className:"text-sm text-emerald-700/80 ml-auto truncate",children:E.ok?E.e164:s})]})});const ke=!Yt;return u.jsxs("div",{className:"space-y-3",children:[u.jsxs("label",{className:"text-sm font-medium text-gray-700",children:["Mobile number ",u.jsx("span",{className:"text-red-500",children:"*"})]}),u.jsxs("div",{className:"flex flex-col sm:flex-row gap-2",children:[u.jsxs("div",{className:"flex items-center gap-2 flex-1 px-3 py-2.5 border border-luxury-border rounded-xl bg-white focus-within:ring-2 focus-within:ring-luxury-gold/40 focus-within:border-luxury-gold transition",children:[u.jsx(Bs,{className:"w-4 h-4 text-luxury-gold flex-none","aria-hidden":"true"}),u.jsx("input",{type:"tel",inputMode:"tel",autoComplete:"tel",value:s,onChange:v=>i(v.target.value),disabled:c==="codeSent"||d,placeholder:"01012345678",className:"flex-1 outline-none bg-transparent disabled:opacity-60","aria-invalid":!!s&&!E.ok}),E.ok&&u.jsx(Be,{className:"w-4 h-4 text-emerald-500 flex-none","aria-hidden":"true"})]}),c!=="codeSent"&&!ke&&u.jsxs("button",{type:"button",onClick:Fe,disabled:d||!E.ok,className:"btn-luxury !py-2.5 whitespace-nowrap disabled:opacity-60",children:[d?u.jsx(dt,{className:"w-4 h-4 animate-spin","aria-hidden":"true"}):u.jsx(Tn,{className:"w-4 h-4","aria-hidden":"true"}),"Send OTP"]})]}),c==="idle"&&s&&!E.ok&&u.jsx("p",{className:"text-xs text-[#e3a4ad]",children:E.error}),c==="idle"&&!ke&&u.jsx("p",{className:"text-xs text-gray-500",children:"We’ll text you a one-time code to confirm this number."}),ke&&u.jsxs("div",{className:"flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5",role:"status",children:[u.jsx(ht,{className:"w-4 h-4 text-amber-600 flex-none mt-0.5","aria-hidden":"true"}),u.jsx("p",{className:"text-xs text-amber-800",children:"SMS verification isn’t configured yet, so this number can’t be verified right now. You can still continue."})]}),c==="codeSent"&&u.jsxs("div",{className:"space-y-2 animate-fade-in",children:[u.jsxs("div",{className:"flex flex-col sm:flex-row gap-2",children:[u.jsx("input",{type:"text",inputMode:"numeric",autoComplete:"one-time-code",maxLength:6,value:a,onChange:v=>o(v.target.value.replace(/\D/g,"").slice(0,6)),placeholder:"••••••",className:"flex-1 px-4 py-2.5 border border-luxury-border rounded-xl bg-white outline-none text-center text-lg tracking-[0.5em] font-mono focus:ring-2 focus:ring-luxury-gold/40 focus:border-luxury-gold transition","aria-label":"6-digit verification code"}),u.jsxs("button",{type:"button",onClick:L,disabled:d||a.length!==6,className:"btn-luxury !py-2.5 whitespace-nowrap disabled:opacity-60",children:[d?u.jsx(dt,{className:"w-4 h-4 animate-spin","aria-hidden":"true"}):u.jsx(Be,{className:"w-4 h-4","aria-hidden":"true"}),"Verify"]})]}),u.jsxs("div",{className:"flex items-center justify-between text-xs",children:[u.jsxs("button",{type:"button",onClick:he,className:"inline-flex items-center gap-1 text-gray-500 hover:text-luxury-gold",children:[u.jsx(Gs,{className:"w-3.5 h-3.5","aria-hidden":"true"})," Change number"]}),N>0?u.jsxs("span",{className:"text-gray-400",children:["Resend OTP in ",N,"s"]}):u.jsxs("button",{type:"button",onClick:Fe,disabled:d,className:"inline-flex items-center gap-1 text-luxury-gold font-medium hover:underline disabled:opacity-60",children:[u.jsx(Ks,{className:"w-3.5 h-3.5","aria-hidden":"true"})," Resend OTP"]})]})]}),C&&!y&&u.jsxs("div",{className:"flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5",role:"status",children:[u.jsx(Tn,{className:"w-4 h-4 text-blue-600 flex-none","aria-hidden":"true"}),u.jsx("span",{className:"text-xs text-blue-800",children:C})]}),y&&u.jsxs("div",{className:"flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5",role:"alert",children:[u.jsx(ht,{className:"w-4 h-4 text-red-600 flex-none","aria-hidden":"true"}),u.jsx("span",{className:"text-xs text-red-700",children:y})]}),u.jsx("div",{ref:nt,id:"recaptcha-container"})]})}export{Uu as A,ju as L,Fu as P,Yt as i};
