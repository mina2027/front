import{c as e,d as r}from"./index-CW8y8ZVV.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=[["circle",{cx:"8",cy:"8",r:"6",key:"3yglwk"}],["path",{d:"M18.09 10.37A6 6 0 1 1 10.34 18",key:"t5s6rm"}],["path",{d:"M7 6h1v4",key:"1obek4"}],["path",{d:"m16.71 13.88.7.71-2.82 2.82",key:"1rbuyh"}]],c=e("coins",n);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=[["path",{d:"M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",key:"1vdc57"}],["path",{d:"M5 21h14",key:"11awu3"}]],y=e("crown",d);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s=[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1",key:"bkv52"}],["path",{d:"M12 8v13",key:"1c76mn"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7",key:"6wjy6b"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5",key:"1ihvrl"}]],w=e("gift",s);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=[["path",{d:"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z",key:"qn84l0"}],["path",{d:"M13 5v2",key:"dyzc3o"}],["path",{d:"M13 17v2",key:"1ont0d"}],["path",{d:"M13 11v2",key:"1wjjxi"}]],u=e("ticket",i);async function m(){const a=await r("/api/rewards/stats");return a.ok?a.data:null}async function p(){const a=await r("/api/rewards/store");return a.ok&&Array.isArray(a.data)?a.data:[]}async function k(){const a=await r("/api/rewards/recommended");return a.ok?a.data:null}async function h(){const a=await r("/api/rewards/redemptions/mine");return a.ok&&Array.isArray(a.data)?a.data:[]}async function f(){const a=await r("/api/rewards/leaderboard");return a.ok&&Array.isArray(a.data)?a.data:[]}async function l(){const a=await r("/api/rewards/rules");return a.ok?a.data:null}async function g(a){const t=await r("/api/rewards/redeem",{method:"POST",body:JSON.stringify({rewardId:a})});return t.ok&&t.data?{ok:!0,redemption:t.data.redemption,balance:t.data.balance}:{ok:!1,message:t.message||"Could not redeem this reward."}}async function b(){const a=await r("/api/rewards/admin/rewards");return a.ok&&Array.isArray(a.data)?a.data:[]}async function v(a){return r("/api/rewards/admin/rewards",{method:"POST",body:JSON.stringify(a)})}async function A(a,t){return r(`/api/rewards/admin/rewards/${a}`,{method:"PUT",body:JSON.stringify(t)})}async function R(a){return r(`/api/rewards/admin/rewards/${a}`,{method:"DELETE"})}async function M(a){const t=await r(`/api/rewards/admin/rewards/${a}/vouchers`);return t.ok&&t.data?t.data:{total:0,available:0,used:0,codes:[]}}async function S(a,t){return r(`/api/rewards/admin/rewards/${a}/vouchers`,{method:"POST",body:JSON.stringify({text:t})})}async function N(){const a=await r("/api/rewards/admin/category-points");return a.ok&&a.data?a.data:{}}async function O(a){const t=await r("/api/rewards/admin/category-points",{method:"PUT",body:JSON.stringify(a)});return t.ok&&t.data?t.data:{}}async function T(){const a=await r("/api/rewards/admin/redemptions");return a.ok&&Array.isArray(a.data)?a.data:[]}async function _(){const a=await r("/api/rewards/admin/analytics");return a.ok?a.data:null}export{c as C,w as G,u as T,b as a,_ as b,N as c,T as d,O as e,A as f,v as g,M as h,R as i,S as j,y as k,m as l,p as m,k as n,h as o,f as p,l as q,g as r};
