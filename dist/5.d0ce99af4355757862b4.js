(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{107:function(e,t,a){"use strict";a.r(t),a.d(t,"AuthCode",(function(){return g})),a.d(t,"AuthPassword",(function(){return v})),a.d(t,"AuthRegister",(function(){return w}));var n=a(0),r=a(1),o=a(6),c=a(3),i=a(23),s=a(40),l=a(17),u=a(48),d=a(20),m=a(2),b=a(132),h=a(119);a(144);const p=o.l?m.Db:m.Cb;var f=Object(n.h)(({code:e,codeLength:t,trackingDirection:a,isTracking:r,isBig:o})=>{const[c,i]=Object(n.r)(),[s,l]=Object(n.r)(),[u,d]=Object(n.r)(!1),f=165/t;Object(n.n)(()=>{c||Object(b.a)("MonkeyIdle").then(i)},[c]),Object(n.n)(()=>{s||Object(b.a)("MonkeyTracking").then(l)},[s]);const g=Object(n.m)(()=>d(!0),[]);return n.a.createElement("div",{id:"monkey",className:o?"big":""},!u&&n.a.createElement("div",{className:"monkey-preview"}),c&&n.a.createElement(h.a,{id:"idleMonkey",size:o?m.Ob:p,className:r?"hidden":void 0,animationData:c,play:!r,onLoad:g}),s&&n.a.createElement(h.a,{id:"trackingMonkey",size:o?m.Ob:p,className:r?"shown":"hidden",animationData:s,playSegment:r?function(){const n=e&&e.length>1||a<0?15+f*(e.length-1):0,r=e.length===t?180:15+f*e.length;return a<1?[r,n]:[n,r]}():void 0,speed:2,noLoop:!0}))});var g=Object(n.h)(Object(r.h)(e=>Object(c.l)(e,["authPhoneNumber","authIsCodeViaApp","authIsLoading","authError"]),(e,t)=>Object(c.l)(t,["setAuthCode","returnToAuthPhoneNumber","clearAuthError"]))(({authPhoneNumber:e,authIsCodeViaApp:t,authIsLoading:a,authError:r,setAuthCode:c,returnToAuthPhoneNumber:m,clearAuthError:b})=>{const h=Object(l.a)(),p=Object(n.q)(null),[g,O]=Object(n.r)(""),[j,v]=Object(n.r)(!1),[E,y]=Object(n.r)(1);Object(n.n)(()=>{o.n||p.current.focus()},[]),Object(s.a)(!0,m);const w=Object(n.m)(e=>{r&&b();const{currentTarget:t}=e;t.value=t.value.replace(/[^\d]+/,"").substr(0,5),t.value!==g&&(O(t.value),j?t.value.length||v(!1):v(!0),g&&g.length>t.value.length?y(-1):y(1),5===t.value.length&&c({code:t.value}))},[r,b,g,j,c]);return n.a.createElement("div",{id:"auth-code-form",className:"custom-scroll"},n.a.createElement("div",{className:"auth-form"},n.a.createElement(f,{code:g,codeLength:5,isTracking:j,trackingDirection:E}),n.a.createElement("h2",null,e,n.a.createElement("div",{className:"auth-number-edit",onClick:m,role:"button",tabIndex:0,title:h("WrongNumber")},n.a.createElement("i",{className:"icon-edit"}))),n.a.createElement("p",{className:"note"},Object(i.a)(h(t?"SentAppCode":"Login.JustSentSms"),["simple_markdown"])),n.a.createElement(u.a,{ref:p,id:"sign-in-code",label:h("Code"),onInput:w,value:g,error:r&&h(r),autoComplete:"one-time-code",inputMode:"numeric"}),a&&n.a.createElement(d.a,null)))})),O=a(154),j=a(155);var v=Object(n.h)(Object(r.h)(e=>Object(c.l)(e,["authIsLoading","authError","authHint"]),(e,t)=>Object(c.l)(t,["setAuthPassword","clearAuthError"]))(({authIsLoading:e,authError:t,authHint:a,setAuthPassword:r,clearAuthError:o})=>{const c=Object(l.a)(),[i,s]=Object(n.r)(!1),u=Object(n.m)(e=>{s(e)},[]),d=Object(n.m)(e=>{r({password:e})},[r]);return n.a.createElement("div",{id:"auth-password-form",className:"custom-scroll"},n.a.createElement("div",{className:"auth-form"},n.a.createElement(O.a,{isPasswordVisible:i}),n.a.createElement("h2",null,c("Login.Header.Password")),n.a.createElement("p",{className:"note"},c("Login.EnterPasswordDescription")),n.a.createElement(j.a,{clearError:o,error:t&&c(t),hint:a,isLoading:e,isPasswordVisible:i,onChangePasswordVisibility:u,onSubmit:d})))})),E=a(22),y=a(136);var w=Object(n.h)(Object(r.h)(e=>Object(c.l)(e,["authIsLoading","authError"]),(e,t)=>Object(c.l)(t,["signUp","clearAuthError","uploadProfilePhoto"]))(({authIsLoading:e,authError:t,signUp:a,clearAuthError:r,uploadProfilePhoto:o})=>{const c=Object(l.a)(),[i,s]=Object(n.r)(!1),[d,m]=Object(n.r)(),[b,h]=Object(n.r)(""),[p,f]=Object(n.r)("");return n.a.createElement("div",{id:"auth-registration-form",className:"custom-scroll"},n.a.createElement("div",{className:"auth-form"},n.a.createElement("form",{action:"",method:"post",onSubmit:function(e){e.preventDefault(),a({firstName:b,lastName:p}),d&&o({file:d})}},n.a.createElement(y.a,{onChange:m}),n.a.createElement("h2",null,c("YourName")),n.a.createElement("p",{className:"note"},c("Login.Register.Desc")),n.a.createElement(u.a,{id:"registration-first-name",label:c("Login.Register.FirstName.Placeholder"),onChange:function(e){t&&r();const{target:a}=e;h(a.value),s(a.value.length>0)},value:b,error:t&&c(t),autoComplete:"given-name"}),n.a.createElement(u.a,{id:"registration-last-name",label:c("Login.Register.LastName.Placeholder"),onChange:function(e){const{target:t}=e;f(t.value)},value:p,autoComplete:"family-name"}),i&&n.a.createElement(E.a,{type:"submit",ripple:!0,isLoading:e},c("Next")))))}))},112:function(e,t,a){"use strict";var n=a(0),r=a(57);var o=a(9),c=a(38),i=a(41),s=a(58),l=a(17),u=a(40),d=a(22),m=a(128);a(156);t.a=({title:e,className:t,isOpen:a,header:b,hasCloseButton:h,noBackdrop:p,children:f,onClose:g,onCloseAnimationEnd:O,onEnter:j,shouldSkipHistoryAnimations:v})=>{const{shouldRender:E,transitionClassNames:y}=Object(i.a)(a,O,v,void 0,v),w=Object(n.q)(null);Object(n.n)(()=>a?Object(r.a)({onEsc:g,onEnter:j}):void 0,[a,g,j]),Object(n.n)(()=>a&&w.current?function(e){function t(t){if("Tab"!==t.key)return;t.preventDefault(),t.stopPropagation();const a=Array.from(e.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));if(!a.length)return;const n=a.findIndex(e=>e.isSameNode(document.activeElement));let r=0;n>=0&&(r=t.shiftKey?n>0?n-1:a.length-1:n<a.length-1?n+1:0),a[r].focus()}return document.addEventListener("keydown",t,!1),()=>{document.removeEventListener("keydown",t,!1)}}(w.current):void 0,[a]);const{forceClose:N}=Object(u.a)(a,g);Object(n.n)(()=>()=>{a&&N()},[]),Object(s.a)(([e])=>(document.body.classList.toggle("has-open-dialog",a),(a||!a&&void 0!==e)&&Object(c.d)(200),()=>{document.body.classList.remove("has-open-dialog")}),[a]);const k=Object(l.a)();if(!E)return;const C=Object(o.a)("Modal",t,y,p&&"transparent-backdrop");return n.a.createElement(m.a,null,n.a.createElement("div",{ref:w,className:C,tabIndex:-1,role:"dialog"},n.a.createElement("div",{className:"modal-container"},n.a.createElement("div",{className:"modal-backdrop",onClick:g}),n.a.createElement("div",{className:"modal-dialog"},b||(e?n.a.createElement("div",{className:"modal-header"},h&&n.a.createElement(d.a,{round:!0,color:"translucent",size:"smaller",ariaLabel:k("Close"),onClick:g},n.a.createElement("i",{className:"icon-close"})),n.a.createElement("div",{className:"modal-title"},e)):void 0),n.a.createElement("div",{className:"modal-content custom-scroll"},f)))))}},119:function(e,t,a){"use strict";var n=a(0),r=a(10),o=a(9),c=a(38),i=a(127);let s,l;async function u(){return s||(s=a.e(7).then(a.bind(null,202)),l=(await s).default),s}setTimeout(u,5e3);t.a=Object(n.h)(({className:e,id:t,animationData:a,play:s,playSegment:d,speed:m,noLoop:b,size:h,quality:p,isLowPriority:f,onLoad:g})=>{const[O,j]=Object(n.r)(),v=Object(n.q)(null),E=Object(n.q)(!1),y=Object(n.q)(!1),w=Object(n.q)();w.current=s;const N=Object(n.q)();N.current=d,Object(n.n)(()=>{if(O||!a)return;const e=()=>{if(!v.current)return;const e=new l(t,v.current,a,{noLoop:b,size:h,quality:p,isLowPriority:f},g);m&&e.setSpeed(m),j(e)};l?e():u().then(()=>{Object(r.b)(()=>{v.current&&e()})})},[O,a,t,f,b,g,p,h,m]),Object(n.n)(()=>()=>{O&&O.destroy()},[O]);const k=Object(n.m)((e=!1)=>{O&&(w.current||N.current)&&(N.current?O.playSegment(N.current):e?O.goToAndPlay(0):O.play())},[O]),C=Object(n.m)(()=>{O&&O.pause()},[O]),L=Object(n.m)(()=>{y.current=!0,O&&(E.current||(E.current=O.isPlaying()),C())},[O,C]),A=Object(n.m)(()=>{E.current&&k(),E.current=!1,y.current=!1},[k]),P=Object(n.m)(()=>{Object(r.b)(A)},[A]);Object(n.n)(()=>{O&&(s||d?y.current?E.current=!0:k(b):y.current?E.current=!1:C())},[O,s,d,b,k,C]),Object(c.c)(L,A),Object(i.a)(L,P);const S=Object(o.a)("AnimatedSticker",e),I=h?`width: ${h}px; height: ${h}px;`:void 0;return n.a.createElement("div",{ref:v,className:S,style:I})})},127:function(e,t,a){"use strict";a.d(t,"a",(function(){return r}));var n=a(0);function r(e,t){Object(n.n)(()=>(e&&!document.hasFocus()&&e(),e&&window.addEventListener("blur",e),t&&window.addEventListener("focus",t),()=>{t&&window.removeEventListener("focus",t),e&&window.removeEventListener("blur",e)}),[e,t])}},128:function(e,t,a){"use strict";var n=a(0),r=a(67);t.a=({containerId:e,className:t,children:a})=>{const o=Object(n.q)(document.createElement("div"));return Object(n.o)(()=>{const a=document.querySelector(e||"#portals");if(!a)return;const n=o.current;return t&&n.classList.add(t),a.appendChild(n),()=>{r.a.render(void 0,n),a.removeChild(n)}},[t,e]),r.a.render(a,o.current)}},132:function(e,t,a){"use strict";a.d(t,"a",(function(){return c}));var n=a(8),r=a(33);const o={MonkeyIdle:a.p+"TwoFactorSetupMonkeyIdle.dea4a492c144df84ddab778dc8a3f0cd.tgs",MonkeyTracking:a.p+"TwoFactorSetupMonkeyTracking.eb5a7a6f166fb7589c12e6248561fb58.tgs",MonkeyClose:a.p+"TwoFactorSetupMonkeyClose.604c4c833d322b7e6c3ea19bef058241.tgs",MonkeyPeek:a.p+"TwoFactorSetupMonkeyPeek.1905436b042520363d7e59f5d7f903ab.tgs",FoldersAll:a.p+"FoldersAll.3f9f9e243d19f0fbf9aaaff11cbd4572.tgs",FoldersNew:a.p+"FoldersNew.9a40d71c0c8be70f5bd14ff2d7bc1593.tgs",DiscussionGroups:a.p+"DiscussionGroupsDucks.9ea453d1be9d1b0ee77a992f8e587485.tgs"};function c(e){const t=o[e].replace(window.location.origin,"");return r.b("file"+t,n.ApiMediaFormat.Lottie)}},136:function(e,t,a){"use strict";var n=a(0),r=a(9),o=a(2),c=a(16),i=a(17),s=a(22),l=a(112),u=a(20);a(157);const d={type:"blob",quality:.8,format:"jpeg",circle:!1};let m,b,h;var p=Object(n.h)(({file:e,onChange:t,onClose:r})=>{const[p,f]=Object(n.r)(!1);Object(n.n)(()=>{e&&(p?async function(e){try{const t=document.getElementById("avatar-crop");if(!t)return;const{offsetWidth:a,offsetHeight:n}=t;h=new m(t,{enableZoom:!0,boundary:{width:a,height:n},viewport:{width:a-16,height:n-16,type:"circle"}});const r=await Object(c.a)(e);await h.bind({url:r})}catch(e){o.r&&console.error(e)}}(e):async function(){return b||(b=Promise.all([a.e(6),a.e(8)]).then(a.bind(null,334)),m=(await b).default),b}().then(()=>f(!0)))},[e,p]);const g=Object(i.a)();return n.a.createElement(l.a,{isOpen:Boolean(e),onClose:r,title:"Drag to reposition",className:"CropModal",hasCloseButton:!0},p?n.a.createElement("div",{id:"avatar-crop"}):n.a.createElement(u.a,null),n.a.createElement(s.a,{className:"confirm-button",round:!0,color:"primary",onClick:async function(){if(!h)return;const e=await h.result(d),a="string"==typeof e?e:Object(c.b)(e,"avatar.jpg");t(a)},ariaLabel:g("CropImage")},n.a.createElement("i",{className:"icon-check"})))});a(158);t.a=Object(n.h)(({title:e="Change your profile picture",disabled:t,currentAvatarBlobUrl:a,onChange:o})=>{const[c,i]=Object(n.r)(),[s,l]=Object(n.r)(a);Object(n.n)(()=>{l(a)},[a]);const u=Object(r.a)(s&&"filled",t&&"disabled");return n.a.createElement("div",{className:"AvatarEditable"},n.a.createElement("label",{className:u,role:"button",tabIndex:0,title:e},n.a.createElement("input",{type:"file",onChange:function(e){const t=e.target;t&&t.files&&t.files[0]&&(i(t.files[0]),t.value="")},accept:"image/png, image/jpeg"}),n.a.createElement("i",{className:"icon-camera-add"}),s&&n.a.createElement("img",{src:s,alt:"Avatar"})),n.a.createElement(p,{file:c,onClose:function(){i(void 0)},onChange:function(e){i(void 0),o(e),s&&URL.revokeObjectURL(s),l(URL.createObjectURL(e))}}))})},144:function(e,t,a){},154:function(e,t,a){"use strict";var n=a(0),r=a(2),o=a(6),c=a(132),i=a(119);a(144);const s=[0,50],l=[0,20],u=[20,0],d=o.l?r.Db:r.Cb;t.a=Object(n.h)(({isPasswordVisible:e,isBig:t})=>{const[a,o]=Object(n.r)(),[m,b]=Object(n.r)(),[h,p]=Object(n.r)(!1),[f,g]=Object(n.r)(!1);Object(n.n)(()=>{a?setTimeout(()=>g(!0),2e3):Object(c.a)("MonkeyClose").then(o)},[a]),Object(n.n)(()=>{m||Object(c.a)("MonkeyPeek").then(b)},[m]);const O=Object(n.m)(()=>p(!0),[]);return n.a.createElement("div",{id:"monkey",className:t?"big":""},!h&&n.a.createElement("div",{className:"monkey-preview"}),a&&n.a.createElement(i.a,{id:"closeMonkey",size:t?r.Ob:d,className:f?"hidden":"shown",animationData:a,playSegment:s,noLoop:!0,onLoad:O}),m&&n.a.createElement(i.a,{id:"peekMonkey",size:t?r.Ob:d,className:f?"shown":"hidden",animationData:m,playSegment:e?l:u,noLoop:!0}))})},155:function(e,t,a){"use strict";var n=a(0),r=a(2),o=a(6),c=a(9),i=a(17),s=a(22);const l=o.l?550:400;t.a=Object(n.h)(({isLoading:e=!1,isPasswordVisible:t,error:a,hint:u,placeholder:d="Password",submitLabel:m="Next",clearError:b,onChangePasswordVisibility:h,onInputChange:p,onSubmit:f})=>{const g=Object(n.q)(null),O=Object(i.a)(),[j,v]=Object(n.r)(""),[E,y]=Object(n.r)(!1);return Object(n.n)(()=>{o.n||setTimeout(()=>{g.current.focus()},l)},[]),Object(n.n)(()=>{a&&requestAnimationFrame(()=>{g.current.focus(),g.current.select()})},[a]),n.a.createElement("form",{action:"",onSubmit:function(t){t.preventDefault(),e||E&&f(j)},autoComplete:"off"},n.a.createElement("div",{className:Object(c.a)("input-group password-input",j&&"touched",a&&"error"),dir:O.isRtl?"rtl":void 0},n.a.createElement("input",{ref:g,className:"form-control",type:t?"text":"password",id:"sign-in-password",value:j||"",autoComplete:"current-password",onChange:function(e){a&&b();const{target:t}=e;v(t.value),y(t.value.length>=r.jb),p&&p(t.value)},dir:"auto"}),n.a.createElement("label",null,a||u||d),n.a.createElement("div",{className:"toggle-password",onClick:function(){h(!t)},role:"button",tabIndex:0,title:"Toggle password visibility"},n.a.createElement("i",{className:t?"icon-eye":"icon-eye-closed"}))),E&&n.a.createElement(s.a,{type:"submit",ripple:!0,isLoading:e},m))})},156:function(e,t,a){},157:function(e,t,a){},158:function(e,t,a){}}]);
//# sourceMappingURL=5.d0ce99af4355757862b4.js.map