1:"$Sreact.fragment"
2:I[23675,["/_next/static/chunks/1542f0ca3692d9ff.js"],"default"]
3:I[32035,["/_next/static/chunks/6e9ac5b86215ad1c.js","/_next/static/chunks/4e23ab0c08513715.js"],"default"]
4:I[91168,["/_next/static/chunks/6e9ac5b86215ad1c.js","/_next/static/chunks/4e23ab0c08513715.js"],"default"]
5:I[77878,["/_next/static/chunks/1542f0ca3692d9ff.js"],""]
:HL["/_next/static/chunks/3147d44743c56768.css","style"]
:HL["/_next/static/chunks/45c7c75254482862.css","style"]
:HL["/_next/static/chunks/71a213232cb1f2fc.css","style"]
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
          0:{"buildId":"_13vPA4p8GGPfAUlyh1k8","rsc":["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/chunks/3147d44743c56768.css","precedence":"next"}],["$","link","1",{"rel":"stylesheet","href":"/_next/static/chunks/45c7c75254482862.css","precedence":"next"}],["$","link","2",{"rel":"stylesheet","href":"/_next/static/chunks/71a213232cb1f2fc.css","precedence":"next"}],["$","script","script-0",{"src":"/_next/static/chunks/1542f0ca3692d9ff.js","async":true}]],["$","html",null,{"lang":"en","children":["$","body",null,{"className":"geist_2ae47f08-module__h69qWW__variable geist_mono_eb58308d-module__w_p2Lq__variable playfair_display_62fbafff-module__QowLcq__variable inter_a869fe2d-module__Nl2jCG__variable antialiased","children":[["$","div",null,{"id":"google_translate_element","style":{"display":"none"}}],["$","$L2",null,{}],["$","$L3",null,{"parallelRouterKey":"children","template":["$","$L4",null,{}],"notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]]}],["$","$L5",null,{"src":"//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit","strategy":"afterInteractive"}],["$","$L5",null,{"id":"google-translate-init","strategy":"afterInteractive","children":"$6"}]]}]}]]}],"loading":null,"isPartial":false}
