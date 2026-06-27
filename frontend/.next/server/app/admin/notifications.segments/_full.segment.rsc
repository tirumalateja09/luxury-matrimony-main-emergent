1:"$Sreact.fragment"
2:I[23675,["/_next/static/chunks/1542f0ca3692d9ff.js"],"default"]
3:I[32035,["/_next/static/chunks/6e9ac5b86215ad1c.js","/_next/static/chunks/4e23ab0c08513715.js"],"default"]
4:I[91168,["/_next/static/chunks/6e9ac5b86215ad1c.js","/_next/static/chunks/4e23ab0c08513715.js"],"default"]
5:I[77878,["/_next/static/chunks/1542f0ca3692d9ff.js"],""]
b:I[75115,["/_next/static/chunks/6e9ac5b86215ad1c.js","/_next/static/chunks/4e23ab0c08513715.js"],"default"]
:HL["/_next/static/chunks/3147d44743c56768.css","style"]
:HL["/_next/static/chunks/45c7c75254482862.css","style"]
:HL["/_next/static/chunks/71a213232cb1f2fc.css","style"]
:HL["/_next/static/media/2a65768255d6b625-s.p.d19752fb.woff2","font",{"crossOrigin":"","type":"font/woff2"}]
:HL["/_next/static/media/797e433ab948586e-s.p.29207c2f.woff2","font",{"crossOrigin":"","type":"font/woff2"}]
:HL["/_next/static/media/83afe278b6a6bb3c-s.p.3a6ba036.woff2","font",{"crossOrigin":"","type":"font/woff2"}]
:HL["/_next/static/media/caa3a2e1cccd8315-s.p.3b6cae6d.woff2","font",{"crossOrigin":"","type":"font/woff2"}]
6:T567,
            function applySavedGoogleLanguage() {
              try {
                var savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
                document.cookie = 'googtrans=/en/' + savedLanguage + '; path=/;';

                var attempt = 0;
                var maxAttempts = 20;

                function syncTranslateDropdown() {
                  var combo = document.querySelector('.goog-te-combo');

                  if (combo) {
                    if (combo.value !== savedLanguage) {
                      combo.value = savedLanguage;
                      combo.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    return;
                  }

                  attempt += 1;
                  if (attempt < maxAttempts) {
                    window.setTimeout(syncTranslateDropdown, 250);
                  }
                }

                syncTranslateDropdown();
              } catch (error) {
                console.warn('Google Translate init sync failed', error);
              }
            }

            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false,
              }, 'google_translate_element');
              applySavedGoogleLanguage();
            }
          0:{"P":null,"b":"_13vPA4p8GGPfAUlyh1k8","c":["","admin","notifications"],"q":"","i":false,"f":[[["",{"children":["admin",{"children":["notifications",{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],[["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/chunks/3147d44743c56768.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}],["$","link","1",{"rel":"stylesheet","href":"/_next/static/chunks/45c7c75254482862.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}],["$","link","2",{"rel":"stylesheet","href":"/_next/static/chunks/71a213232cb1f2fc.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}],["$","script","script-0",{"src":"/_next/static/chunks/1542f0ca3692d9ff.js","async":true,"nonce":"$undefined"}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"geist_2ae47f08-module__h69qWW__variable geist_mono_eb58308d-module__w_p2Lq__variable playfair_display_62fbafff-module__QowLcq__variable inter_a869fe2d-module__Nl2jCG__variable antialiased","children":[["$","div",null,{"id":"google_translate_element","style":{"display":"none"}}],["$","$L2",null,{}],["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]],"forbidden":"$undefined","unauthorized":"$undefined"}],["$","$L5",null,{"src":"//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit","strategy":"afterInteractive"}],["$","$L5",null,{"id":"google-translate-init","strategy":"afterInteractive","children":"$6"}]]}]}]]}],{"children":["$L7",{"children":["$L8",{"children":["$L9",{},null,false,false]},null,false,false]},null,false,false]},null,false,false],"$La",false]],"m":"$undefined","G":["$b",[]],"S":true}
c:I[34636,["/_next/static/chunks/6e9ac5b86215ad1c.js","/_next/static/chunks/4e23ab0c08513715.js"],"ClientSegmentRoot"]
d:I[21780,["/_next/static/chunks/1542f0ca3692d9ff.js","/_next/static/chunks/4e3bd116560bc6dc.js"],"default"]
f:I[73440,["/_next/static/chunks/6e9ac5b86215ad1c.js","/_next/static/chunks/4e23ab0c08513715.js"],"ClientPageRoot"]
10:I[33227,["/_next/static/chunks/1542f0ca3692d9ff.js","/_next/static/chunks/4e3bd116560bc6dc.js","/_next/static/chunks/b19b603f973d765a.js"],"default"]
13:I[64381,["/_next/static/chunks/6e9ac5b86215ad1c.js","/_next/static/chunks/4e23ab0c08513715.js"],"OutletBoundary"]
14:"$Sreact.suspense"
16:I[64381,["/_next/static/chunks/6e9ac5b86215ad1c.js","/_next/static/chunks/4e23ab0c08513715.js"],"ViewportBoundary"]
18:I[64381,["/_next/static/chunks/6e9ac5b86215ad1c.js","/_next/static/chunks/4e23ab0c08513715.js"],"MetadataBoundary"]
7:["$","$1","c",{"children":[[["$","script","script-0",{"src":"/_next/static/chunks/4e3bd116560bc6dc.js","async":true,"nonce":"$undefined"}]],["$","$Lc",null,{"Component":"$d","slots":{"children":["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]},"serverProvidedParams":{"params":{},"promises":["$@e"]}}]]}]
8:["$","$1","c",{"children":[null,["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}]
9:["$","$1","c",{"children":[["$","$Lf",null,{"Component":"$10","serverProvidedParams":{"searchParams":{},"params":"$7:props:children:1:props:serverProvidedParams:params","promises":["$@11","$@12"]}}],[["$","script","script-0",{"src":"/_next/static/chunks/b19b603f973d765a.js","async":true,"nonce":"$undefined"}]],["$","$L13",null,{"children":["$","$14",null,{"name":"Next.MetadataOutlet","children":"$@15"}]}]]}]
a:["$","$1","h",{"children":[null,["$","$L16",null,{"children":"$L17"}],["$","div",null,{"hidden":true,"children":["$","$L18",null,{"children":["$","$14",null,{"name":"Next.Metadata","children":"$L19"}]}]}],["$","meta",null,{"name":"next-size-adjust","content":""}]]}]
e:"$7:props:children:1:props:serverProvidedParams:params"
11:{}
12:"$7:props:children:1:props:serverProvidedParams:params"
17:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
1a:I[12843,["/_next/static/chunks/6e9ac5b86215ad1c.js","/_next/static/chunks/4e23ab0c08513715.js"],"IconMark"]
15:null
19:[["$","title","0",{"children":"RVR LUXURY MATRIMONY"}],["$","meta","1",{"name":"description","content":"Premium Matrimony Service for Discerning Individuals"}],["$","link","2",{"rel":"icon","href":"/icon.png"}],["$","$L1a","3",{}]]
