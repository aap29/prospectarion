(function(){
var CFG=Object.assign({whats:'5551984168848',leadsUrl:''},window.SITE_CFG||{});
var $=function(s){return document.querySelector(s)};
var num=function(v){return Number(String(v||'').replace(/\D/g,''))||0};
var mil=function(v){var d=String(v||'').replace(/\D/g,'');return d?Number(d).toLocaleString('pt-BR'):''};
var brl=function(v){return 'R$ '+Math.round(v).toLocaleString('pt-BR')};
var cidade=document.body.dataset.cidade||'';
var ORIG=(function(){var o=null;try{o=JSON.parse(sessionStorage.getItem('iirs.orig')||'null')}catch(e){}var q=new URLSearchParams(location.search);
 if(!o||q.get('utm_source')||q.get('gclid')){var ref='';try{ref=document.referrer&&new URL(document.referrer).hostname!==location.hostname?document.referrer:''}catch(e){}
  o={utm_source:q.get('utm_source')||(q.get('gclid')?'google':'')||(ref?new URL(ref).hostname.replace(/^www\./,''):'')||'direto',utm_medium:q.get('utm_medium')||(q.get('gclid')?'cpc':ref?'referencia':''),utm_campaign:q.get('utm_campaign')||'',termo:q.get('utm_term')||q.get('q')||'',referrer:ref,entrada:location.href,quando:new Date().toISOString()};
  try{sessionStorage.setItem('iirs.orig',JSON.stringify(o))}catch(e){}}return o})();
var origemTxt=function(){return [ORIG.utm_source,ORIG.utm_medium,ORIG.utm_campaign].filter(Boolean).join(' / ')+(ORIG.termo?' · pesquisou "'+ORIG.termo+'"':'')};
var wa=function(t){return 'https://wa.me/'+CFG.whats+'?text='+encodeURIComponent(t)};
document.querySelectorAll('[data-wa]').forEach(function(a){a.href=wa('Olá, Anderson! Vim pelo guia '+(cidade?'de '+cidade:document.title.split('|')[0].trim())+' no seu site e quero ajuda.');a.target='_blank';a.rel='noopener'});
function sim(){var f=$('#simForm');if(!f)return;var F=JSON.parse(f.dataset.faixas);var r=num($('#sm_r').value),v=num($('#sm_v').value),e=num($('#sm_e').value);
 var fin=Math.max(0,Math.min(v-e,v*.8)),fx=F.find(function(x){return r<=x.renda&&v<=x.teto}),tx=fx?fx.juros:11.49,i=Math.pow(1+tx/100,1/12)-1,n=420,p=fin/n+fin*i,c=r?Math.round(p/r*100):0;
 $('#simOut').innerHTML=fin?'<span>1ª parcela estimada (SAC, 35 anos)</span><b>'+brl(p)+'</b><span>'+(fx?fx.faixa+' do Minha Casa Minha Vida, ':'Financiamento comum, ')+String(tx).replace('.',',')+'% a.a. · financiado '+brl(fin)+'</span><span>'+(c?(c<=30?'Usa '+c+'% da renda: dentro do limite de 30%.':'Usa '+c+'% da renda: acima de 30%. Aumente a entrada ou escolha um imóvel menor.'):'')+'</span>':'<span>Informe renda, valor e entrada.</span>'}
document.addEventListener('input',function(e){if(['sm_r','sm_v','sm_e'].indexOf(e.target.id)>=0){var f=mil(e.target.value);if(e.target.value!==f)e.target.value=f;sim()}});sim();
var tipo='contato';
var T={contato:'Quero ser atendido',simular:'Quero a simulação oficial',vender:'Quero vender meu imóvel',consorcio:'Quero uma proposta de consórcio'};
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-lead]');if(b){tipo=b.dataset.lead;$('#lfTitle').textContent=T[tipo]||T.contato;
 $('#lf_msg').value=tipo==='simular'&&$('#sm_r')?'Renda R$ '+$('#sm_r').value+', imóvel de R$ '+$('#sm_v').value+', entrada R$ '+$('#sm_e').value+(cidade?' em '+cidade:'')+'.':'';$('#leadOv').hidden=false;$('#lf_nome').focus()}
 if(e.target.id==='lfClose'||e.target.id==='leadOv')$('#leadOv').hidden=true});
$('#leadForm').addEventListener('submit',function(e){e.preventDefault();var nome=$('#lf_nome').value.trim(),fone=$('#lf_fone').value.trim();
 if(!nome||fone.replace(/\D/g,'').length<10||!$('#lf_ok').checked)return;
 var lead={data:new Date().toISOString(),nome:nome,fone:fone,email:$('#lf_email').value.trim(),intencao:T[tipo]||T.contato,tipo:tipo,imovel:'',imovelTitulo:'Guia: '+(cidade||document.title.split('|')[0].trim()),link:location.href,cidade:cidade,mensagem:$('#lf_msg').value.trim(),renda:$('#sm_r')?$('#sm_r').value:'',pagina:location.href,origem:origemTxt(),utm_source:ORIG.utm_source,utm_medium:ORIG.utm_medium,utm_campaign:ORIG.utm_campaign,termo:ORIG.termo,referrer:ORIG.referrer,paginaEntrada:ORIG.entrada,consentimento:'sim'};
 if(CFG.leadsUrl){try{fetch(CFG.leadsUrl,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(lead)})}catch(x){}}
 $('#leadOv').hidden=true;window.open(wa('Olá, Anderson! Sou '+nome+'. '+lead.intencao+(cidade?' em '+cidade:'')+'. '+lead.mensagem),'_blank','noopener')});

function menu(on){var d=$('#drawer');if(!d)return;d.hidden=!on;document.body.classList.toggle('menu-open',on);document.querySelectorAll('.top .menu-btn').forEach(function(b){b.setAttribute('aria-expanded',on)});if(on){var a=d.querySelector('nav a');a&&a.focus()}}
function updRails(){document.querySelectorAll('.railw').forEach(function(w){var r=w.querySelector('.rail');if(!r)return;w.querySelector('.prev').disabled=r.scrollLeft<4;w.querySelector('.next').disabled=r.scrollLeft+r.clientWidth>=r.scrollWidth-4})}
document.addEventListener('click',function(e){var t=e.target;if(!t.closest)return;
 var m=t.closest('[data-menu]');if(m){e.preventDefault();menu(m.dataset.menu==='1');return}
 if(t.closest('#drawer nav a'))menu(false);
 var rb=t.closest('[data-rb]');if(rb){var r=rb.parentElement.querySelector('.rail');r.scrollBy({left:Number(rb.dataset.rb)*r.clientWidth*.9,behavior:'smooth'})}},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape'){menu(false);$('#leadOv').hidden=true}});
document.addEventListener('scroll',function(e){if(e.target.classList&&e.target.classList.contains('rail'))updRails()},true);
window.addEventListener('resize',function(){updRails();if(innerWidth>1080)menu(false)});updRails();
})();
