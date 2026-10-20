/* Zoho OAuth: somente inicia autorização; não envia mensagens. */
(function(root){'use strict';
const $=id=>document.getElementById(id);
function show(){
  $('new').hidden=true;
  $('search').closest('.search-wrap').hidden=true;
  $('view-title').textContent='Conexão Zoho Mail';
  $('view-description').textContent='Autorize sua conta para preparar o módulo de cobranças Sicoob.';
  $('summary').replaceChildren();$('finance-controls').replaceChildren();$('calendar-board').replaceChildren();
  const wrap=$('records');wrap.replaceChildren();
  const card=document.createElement('article');card.className='record';
  const title=document.createElement('h2');title.textContent='Zoho Mail · autorização segura';card.append(title);
  const intro=document.createElement('p');intro.textContent='A conexão permite autorizar sua conta Zoho. Esta versão não envia e-mails, não importa boletos e não dispara cobranças.';card.append(intro);
  const status=document.createElement('p');status.setAttribute('role','status');status.id='zoho-connect-status';
  const result=new URL(location.href).searchParams.get('zoho');
  const labels={connected:'O Zoho retornou uma autorização concluída. A conexão ainda precisa ser validada no servidor antes de habilitar envios.',authorization_denied:'A autorização foi cancelada.',invalid_callback:'Retorno inválido do Zoho.',invalid_state:'Solicitação expirada ou inválida. Tente novamente.',state_already_used:'Esta autorização já foi utilizada. Inicie outra.',token_error:'O Zoho não forneceu um token de renovação. Verifique a autorização.',connection_error:'Não foi possível concluir a conexão. Consulte os logs da função.'};
  status.textContent=labels[result]||'Nenhuma autorização concluída neste navegador.';card.append(status);
  if(result){const clean=new URL(location.href);clean.searchParams.delete('zoho');history.replaceState(null,'',clean.pathname+clean.search+clean.hash);}
  const btn=document.createElement('button');btn.type='button';btn.textContent='Conectar Zoho Mail';
  btn.onclick=async()=>{
    btn.disabled=true;status.textContent='Preparando autorização…';
    try{
      const {data:sessionData,error:sessionError}=await root.HSN_ZOHO_CLIENT.auth.getSession();
      if(sessionError||!sessionData.session?.access_token)throw Error('Faça login novamente no Financeiro HSN.');
      const {data,error}=await root.HSN_ZOHO_CLIENT.functions.invoke('zoho-oauth-start',{method:'POST',headers:{Authorization:'Bearer '+sessionData.session.access_token}});
      if(error)throw Error(error.message||'Não foi possível iniciar a autorização.');
      if(!data?.url||!data.url.startsWith('https://accounts.zoho.com/oauth/v2/auth?'))throw Error('O servidor não retornou um endereço válido de autorização.');
      location.assign(data.url);
    }catch(error){status.textContent='Falha: '+error.message;btn.disabled=false;}
  };card.append(btn);
  const note=document.createElement('p');note.className='muted';note.textContent='Nenhuma cobrança será enviada sem a etapa posterior de revisão e confirmação.';card.append(note);
  wrap.append(card);
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='zoho_connect'));
}
root.HSN_ZOHO={show};
})(window);
