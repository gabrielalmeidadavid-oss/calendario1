// ======================================
// FUNÇÕES AUXILIARES
// ======================================

// $ é uma função curta para selecionar um elemento HTML pelo seletor CSS.
// Exemplo: $('h1') seleciona o primeiro elemento <h1> da página.
const $ = s => document.querySelector(s),

// esc transforma caracteres especiais em entidades HTML.
// Isso evita que textos inseridos pelo usuário sejam interpretados como HTML.
// Exemplo: < vira &lt; e & vira &amp;.
esc = s => String(s).replace(/[&<>"]/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
}[c])),

// iso transforma uma data no formato YYYY-MM-DD.
// O formato sv-SE utiliza ano-mês-dia.
iso = d => d.toLocaleDateString('sv-SE'),

// Retorna a data de hoje no formato YYYY-MM-DD.
hoje = () => iso(new Date()),

// Retorna o horário atual convertido para minutos.
// Exemplo: 14h30 = 14 * 60 + 30 = 870 minutos.
nowMin = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
},

// Converte minutos para o formato HH:MM.
// Exemplo: 540 vira "09:00".
// padStart(2, '0') adiciona zero à esquerda quando necessário.
hm = m =>
  String(Math.floor(m / 60)).padStart(2, '0')
  + ':' +
  String(m % 60).padStart(2, '0'),

// Converte uma duração em minutos para um formato mais legível.
// Se for maior ou igual a 60 minutos, mostra horas.
// Exemplo: 90 vira "1h30".
// Se for menor que 60, mostra minutos.
dur = m =>
  m >= 60
    ? Math.floor(m / 60) + 'h' +
      (m % 60 ? String(m % 60).padStart(2, '0') : '')
    : m + ' min',

// Converte um horário "HH:MM" para minutos.
// Exemplo: "09:30" vira 570.
// split(':') separa horas e minutos.
// O sinal + transforma os valores em números.
toMin = v => {
  const [a, b] = v.split(':');
  return +a * 60 + +b;
},

// Cria um identificador único usando a data atual e números aleatórios.
// É utilizado para diferenciar eventos e outros elementos.
uid = () =>
  Date.now().toString(36) +
  Math.random().toString(36).slice(2, 5),

// DI representa o início da agenda: 07:00.
// 7 * 60 = 420 minutos.
DI = 420,

// DF representa o final da agenda: 22:00.
// 22 * 60 = 1320 minutos.
DF = 1320,

// PX define quantos pixels representam cada minuto na linha do tempo.
// 0.9 significa que cada minuto ocupa 0.9 pixel.
PX = .9,

// KEY é a chave utilizada para guardar os dados no LocalStorage.
// Essa chave identifica os dados do SmartAgenda no navegador.
KEY = 'smartagenda:v1';


// ======================================
// DADOS DO SMARTAGENDA
// ======================================

// S será o objeto principal que armazenará todos os dados da agenda.
// null significa que ainda não recebeu nenhum valor.
let S = null;

// Tenta recuperar os dados salvos anteriormente no navegador.
try {
  // localStorage.getItem(KEY) busca os dados usando a chave definida.
  // JSON.parse transforma o texto armazenado novamente em um objeto JavaScript.
  S = JSON.parse(localStorage.getItem(KEY));

} catch {
  // Se os dados estiverem corrompidos ou ocorrer algum erro,
  // o bloco catch impede que o programa pare.
  // S continua null e os dados padrão serão criados.
}


// ======================================
// CRIAÇÃO DOS DADOS PADRÃO
// ======================================

// Se S for null, undefined ou outro valor considerado falso,
// significa que não existem dados carregados.
if (!S) {

  // Cria a estrutura inicial do SmartAgenda.
  S = {

    // ev armazenará os eventos separados por data.
    // Exemplo: ev["2026-11-04"] contém os eventos desse dia.
    ev: {},

    // lemb armazenará os lembretes.
    // [] significa que começa como uma lista vazia.
    lemb: [],

    // md guardará a data da última atualização diária das metas.
    md: '',

    // tema guardará a preferência entre claro e escuro.
    // null significa que ainda não foi definido.
    tema: null,

    // tarefas contém as tarefas iniciais do usuário.
    tarefas: [

      // t representa o texto da tarefa.
      // f representa seu estado: 0 = não concluída.
      { t: 'Revisar a aula de HTML e CSS', f: 0 },

      { t: 'Avançar no projeto pessoal', f: 0 },

      { t: 'Separar a roupa de treino', f: 0 }
    ],

    // metas contém os objetivos diários.
    metas: [

      // n = nome da meta.
      // un = unidade de medida.
      // alvo = quantidade desejada.
      // v = progresso atual.
      // passo = quantidade adicionada por vez.
      { n: 'Estudar', un: 'min', alvo: 60, v: 0, passo: 25 },

      { n: 'Exercício', un: 'min', alvo: 30, v: 0, passo: 15 },

      { n: 'Leitura', un: 'min', alvo: 20, v: 0, passo: 10 }
    ]
  };

  // Cria os eventos de exemplo para o dia atual.
  // S.ev[hoje()] acessa a lista de eventos da data de hoje.
  S.ev[hoje()] = [

    // id identifica o evento.
    // t é o título.
    // i é o horário inicial em minutos.
    // f é o horário final em minutos.
    // c é a classe visual usada no CSS.
    { id: uid(), t: 'Aula online', i: 540, f: 660, c: 'ev' },

    // 720 minutos = 12:00.
    // 780 minutos = 13:00.
    { id: uid(), t: 'Almoço', i: 720, f: 780, c: 'ev' },

    // 930 minutos = 15:30.
    // 990 minutos = 16:30.
    { id: uid(), t: 'Reunião do grupo', i: 930, f: 990, c: 'ev' }
  ];
}


// ======================================
// RESET DIÁRIO DE METAS E LEMBRETES
// ======================================

// Verifica se a data salva em S.md é diferente da data de hoje.
// Isso permite reiniciar o progresso quando um novo dia começa.
if (S.md !== hoje()) {

  // Percorre todas as metas e zera seu progresso.
  // m representa cada meta individualmente.
  S.metas.forEach(m => m.v = 0);

  // Percorre os lembretes e marca todos como não concluídos.
  // l representa cada lembrete.
  S.lemb.forEach(l => l.ok = 0);

  // Atualiza a data do último reset para hoje.
  S.md = hoje();
}


// ======================================
// SALVAR DADOS NO LOCALSTORAGE
// ======================================

// Cria a função save, responsável por salvar os dados.
const save = () => {

  try {
    // JSON.stringify transforma o objeto S em texto JSON.
    // localStorage.setItem salva esse texto no navegador.
    // Os dados permanecem salvos mesmo após fechar a página.
    localStorage.setItem(KEY, JSON.stringify(S));

  } catch {
    // Se ocorrer algum erro ao salvar, ele é ignorado.
    // Exemplo: armazenamento do navegador cheio.
  }
};

// Define a variável dia como a data atual.
// Ela controla qual dia está sendo exibido na agenda.
let dia = hoje();


// ======================================
// TEMA CLARO E ESCURO
// ======================================

// Define a função responsável por trocar o tema.
function setTema(t) {

  // Salva a escolha do tema dentro do objeto principal.
  S.tema = t;

  // Define o atributo data-tema na tag <html>.
  // O CSS pode usar [data-tema="dark"] para aplicar o tema escuro.
  document.documentElement.dataset.tema = t;

  // Seleciona o botão com id="tema".
  // Atualiza o texto para indicar a opção disponível.
  // Há um botão de tema na tela de acesso (#tema2) e outro na plataforma (#tema).
  document.querySelectorAll('#tema, #tema2').forEach(el => {
    el.textContent = t === 'dark' ? 'Modo claro' : 'Modo escuro';
  });

  // Salva a preferência no LocalStorage.
  save();
}

// Define o tema inicial da página.
setTema(

  // Se S.tema já existir, utiliza o tema salvo pelo usuário.
  // O operador || utiliza a próxima opção se o valor anterior for falso.
  S.tema ||

  // Caso ainda não exista uma preferência salva,
  // verifica o tema preferido do sistema operacional.
  (
    matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark'
  )
);


// ======================================
// AGENDA E HORÁRIOS LIVRES
// ======================================

// Cria uma função que recebe uma data d.
const evs = d =>

  // Se S.ev[d] ainda não existir, cria uma lista vazia.
  // Se já existir, utiliza a lista existente.
  (S.ev[d] = S.ev[d] || [])

  // Ordena os eventos do dia pelo horário de início.
  // a e b representam dois eventos comparados.
  // Se a.i for menor que b.i, a aparece primeiro.
  .sort((a, b) => a.i - b.i);


// ======================================
// CRIAÇÃO DE EVENTOS
// ======================================

// addEv recebe:
// d = data do evento.
// t = título.
// i = horário inicial em minutos.
// f = horário final em minutos.
// c = classe CSS, com 'ev' como valor padrão.
function addEv(d, t, i, f, c = 'ev') {

  // Verifica se o título está vazio
  // ou se o horário final não é depois do inicial.
  if (!t || !(f > i))

    // Retorna uma mensagem de erro.
    // return encerra a execução da função.
    return 'Preencha o nome e use um fim depois do início.';

  // Procura um evento que tenha conflito de horário.
  const x = evs(d).find(

    // Existe conflito quando:
    // o novo início ocorre antes do fim de outro evento
    // E o novo fim ocorre depois do início desse evento.
    // Isso identifica qualquer sobreposição de horários.
    e => i < e.f && f > e.i
  );

  // Se x encontrou um evento conflitante,
  // retorna uma mensagem informando qual é o conflito.
  if (x)
    return `Conflito com “${x.t}” (${hm(x.i)} às ${hm(x.f)}).`;

  // Se não houver conflito, adiciona o evento à lista do dia.
  evs(d).push({

    // Cria um identificador único.
    id: uid(),

    // Guarda o título do evento.
    t,

    // Guarda o horário inicial.
    i,

    // Guarda o horário final.
    f,

    // Guarda a classe visual.
    c
  });

  // Atualiza a interface para mostrar o novo evento.
  save();
  render();
}


// ======================================
// CÁLCULO DE HORÁRIOS LIVRES
// ======================================

// livres recebe uma data e calcula os períodos disponíveis.
function livres(d) {

  // c representa o horário a partir do qual
  // começaremos a procurar períodos livres.
  // DI = 420 minutos = 07:00.
  let c = DI;

  // Se a data analisada for hoje,
  // não considera horários que já passaram.
  if (d === hoje())

    // nowMin() retorna o horário atual em minutos.
    // Math.ceil arredonda para cima.
    // Multiplicar e dividir por 5 arredonda para o próximo
    // intervalo de 5 minutos.
    // Math.max garante que nunca comece antes das 07:00.
    c = Math.max(
      DI,
      Math.ceil(nowMin() / 5) * 5
    );

  // Cria uma lista vazia para armazenar os horários livres.
  const out = [];

  // Percorre os eventos do dia em ordem de horário.
  for (const e of evs(d)) {

    // Se o evento começar depois do horário atual analisado
    // e ainda estivermos antes das 22:00,
    // existe um intervalo livre antes desse evento.
    if (e.i > c && c < DF)

      // Adiciona o período livre à lista.
      // Math.min impede que o intervalo ultrapasse 22:00.
      out.push([
        c,
        Math.min(e.i, DF)
      ]);

    // Atualiza c para o final do evento.
    // Math.max evita que c volte para um horário anterior.
    c = Math.max(c, e.f);
  }

  // Depois de analisar todos os eventos,
  // verifica se ainda existe tempo livre até as 22:00.
  if (c < DF)

    // Adiciona o último intervalo livre.
    out.push([c, DF]);

  // Retorna somente períodos com pelo menos 15 minutos.
  // Cada intervalo é representado por [início, fim].
  return out.filter(
    ([a, b]) => b - a >= 15
  );
}


// ======================================
// ANIMAÇÕES
// ======================================

// Set é uma estrutura que guarda valores únicos.
// Aqui será usada para lembrar quais elementos já apareceram.
const vistos = new Set(),

// nv recebe uma chave k e verifica se ela já foi vista.
nv = k => {

  // n será true se a chave ainda não estiver no conjunto.
  const n = !vistos.has(k);

  // Registra a chave como vista.
  vistos.add(k);

  // Se for a primeira vez, retorna a classe CSS "nv".
  // Caso contrário, retorna uma string vazia.
  // Isso permite animar apenas elementos novos.
  return n ? ' nv' : '';
};

// sair recebe um elemento HTML e uma função de callback.
const sair = (el, fn) => {

  // Se o elemento não existir,
  // executa a função imediatamente.
  if (!el) return fn();

  // Adiciona a classe CSS "sai".
  // O CSS pode utilizar essa classe para animar a saída.
  el.classList.add('sai');

  // Aguarda 260 milissegundos e depois executa fn.
  // setTimeout permite que a animação termine antes da ação.
  setTimeout(fn, 260);
};

// Verifica se o usuário prefere animações reduzidas.
// Isso ajuda a respeitar configurações de acessibilidade.
const reduz =
  matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;


// ======================================
// RENDERIZAÇÃO DA AGENDA
// ======================================

// ultDia guarda o último dia desenhado (para animar a troca de dia).
let ultDia = null;

function rAgenda() {

  const base = new Date(dia + 'T12:00'),
        ini = new Date(base);

  // Volta até o domingo da semana do dia selecionado.
  ini.setDate(base.getDate() - base.getDay());

  // ---- faixa da semana (7 botões) ----
  let h = '';

  for (let i = 0; i < 7; i++) {

    const d = new Date(ini);
    d.setDate(ini.getDate() + i);

    const k = iso(d),
          nome = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
          marca = (S.ev[k] || []).length ? '<i></i>' : '';

    h += `<button type="button" class="dd${k === dia ? ' on' : ''}${k === hoje() ? ' hj' : ''}" data-d="${k}"><span>${nome}</span><b>${d.getDate()}</b>${marca}</button>`;
  }

  // Só mexe no HTML da semana se algo mudou (evita reiniciar animações).
  const sem = $('#semana');
  if (sem.dataset.h !== h) {
    sem.innerHTML = h;
    sem.dataset.h = h;
  }

  $('#dtitulo').textContent =
    base.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Animação de troca de dia.
  if (ultDia && ultDia !== dia) {
    vistos.clear();
    const tl = $('#tl');
    tl.classList.remove('troca');
    void tl.offsetWidth;
    tl.classList.add('troca');
  }
  ultDia = dia;

  // ---- linha do tempo ----
  let t = '';

  // Linhas de hora em hora.
  for (let m = DI; m <= DF; m += 60) {
    t += `<div class="hr" style="top:${(m - DI) * PX}px"><span>${hm(m)}</span></div>`;
  }

  // Blocos livres (clicar neles preenche o formulário).
  livres(dia).forEach(([a, b]) => {
    t += `<button type="button" class="lv${nv('l' + dia + a + '-' + b)}" data-a="${a}" data-b="${b}" style="top:${(a - DI) * PX}px;height:${(b - a) * PX - 2}px"><b>Livre</b> ${hm(a)} às ${hm(b)}, ${dur(b - a)}</button>`;
  });

  // Linha "agora".
  const n = nowMin();
  if (dia === hoje() && n >= DI && n <= DF) {
    t += `<div class="nw" style="top:${(n - DI) * PX}px"><em>agora</em></div>`;
  }

  // Compromissos.
  evs(dia).forEach(e => {
    t += `<div class="ev ${e.c}${nv('e' + e.id)}" style="top:${(e.i - DI) * PX}px;height:${Math.max((e.f - e.i) * PX - 2, 24)}px"><span>${esc(e.t)}</span><small>${hm(e.i)} às ${hm(e.f)}</small><button type="button" data-x="${e.id}" aria-label="Remover ${esc(e.t)}">×</button></div>`;
  });

  $('#tl').innerHTML = t;
  $('#tl').style.height = (DF - DI) * PX + 'px';
}

// Rola a agenda até a hora atual (hoje) ou até o primeiro compromisso.
function rolar() {

  const w = $('#tlw');
  if (!w) return;

  const lista = evs(dia);
  const alvo = dia === hoje() ? nowMin() : (lista.length ? lista[0].i : DI);

  w.scrollTop = Math.max(0, (alvo - DI) * PX - 80);
}


// ======================================
// METAS
// ======================================

function rMetas() {

  $('#metas').innerHTML = S.metas.map((m, i) => {

    const p = Math.min(100, Math.round(m.v / m.alvo * 100)),
          novo = nv('m' + i),
          sem = novo ? '' : 'animation:none;';

    return `<div class="meta${m.v >= m.alvo ? ' feita' : ''}" style="--k:${i};${sem}">
      <div><b>${esc(m.n)}</b><span>${m.v}/${m.alvo} ${esc(m.un)}</span></div>
      <div class="bar"><i style="width:${p}%"></i></div>
      <button type="button" data-m="${i}" aria-label="Adicionar ${m.passo} ${esc(m.un)} em ${esc(m.n)}">+${m.passo}</button>
    </div>`;
  }).join('');
}


// ======================================
// TAREFAS
// ======================================

function rTarefas() {

  $('#tarefas').innerHTML = S.tarefas.length
    ? S.tarefas.map((x, i) => `<li class="${x.f ? 'ok' : ''}${nv('t' + i + x.t)}" style="--k:${i}">
        <label><input type="checkbox" data-t="${i}" ${x.f ? 'checked' : ''}><span>${esc(x.t)}</span></label>
        <button type="button" data-dt="${i}" aria-label="Remover tarefa">×</button>
      </li>`).join('')
    : '<li class="vz">Nenhuma tarefa. Adicione a primeira!</li>';
}


// ======================================
// LEMBRETES
// ======================================

function rLemb() {

  const lista = [...S.lemb].sort((a, b) => a.h - b.h);

  $('#lemb').innerHTML = lista.length
    ? lista.map((l, i) => `<li class="${l.ok ? 'ok' : ''}${nv('l' + l.id)}" style="--k:${i}">
        <label><input type="checkbox" data-l="${l.id}" ${l.ok ? 'checked' : ''}><span><b>${hm(l.h)}</b> ${esc(l.t)}</span></label>
        <button type="button" data-dl="${l.id}" aria-label="Remover lembrete">×</button>
      </li>`).join('')
    : '<li class="vz">Nenhum lembrete por enquanto.</li>';
}


// ======================================
// PROGRESSO DO DIA
// ======================================

function rProg() {

  // Cada meta vale de 0 a 1; cada tarefa e lembrete vale 0 ou 1.
  const itens = [
    ...S.metas.map(m => Math.min(1, m.v / m.alvo)),
    ...S.tarefas.map(x => x.f ? 1 : 0),
    ...S.lemb.map(l => l.ok ? 1 : 0)
  ];

  const total = itens.length,
        soma = itens.reduce((a, b) => a + b, 0),
        pct = total ? Math.round(soma / total * 100) : 0,
        feitos = itens.filter(v => v >= 1).length;

  $('#pv').textContent = pct + '%';
  $('#pb').style.width = pct + '%';
  $('#pg').setAttribute('aria-valuenow', pct);
  $('#pt').textContent = `${feitos} de ${total} itens concluídos hoje`;
}


// ======================================
// DESENHA TUDO
// ======================================

function render() {
  rAgenda();
  rMetas();
  rTarefas();
  rLemb();
  rProg();
}


// ======================================
// AVISO (TOAST)
// ======================================

let tt = 0;

function toast(msg) {

  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');

  clearTimeout(tt);
  tt = setTimeout(() => el.classList.remove('show'), 2800);
}


// ======================================
// CLIQUES E FORMULÁRIOS
// ======================================

document.addEventListener('click', ev => {

  const b = ev.target.closest('button');
  if (!b) return;

  // Tema claro/escuro.
  if (b.id === 'tema' || b.id === 'tema2') {
    setTema(S.tema === 'dark' ? 'light' : 'dark');
    return;
  }

  // Semana anterior / próxima.
  if (b.dataset.w) {
    const d = new Date(dia + 'T12:00');
    d.setDate(d.getDate() + Number(b.dataset.w));
    dia = iso(d);
    rAgenda();
    rolar();
    return;
  }

  // Escolher um dia.
  if (b.dataset.d) {
    dia = b.dataset.d;
    rAgenda();
    rolar();
    return;
  }

  // Clicar num bloco livre: preenche o formulário.
  if (b.dataset.a) {
    const a = Number(b.dataset.a),
          f = Math.min(Number(b.dataset.b), a + 60);
    $('#ei').value = hm(a);
    $('#ef').value = hm(f);
    $('#erro').textContent = '';
    $('#et').focus();
    return;
  }

  // Remover compromisso.
  if (b.dataset.x) {
    sair(b.closest('.ev'), () => {
      S.ev[dia] = evs(dia).filter(e => e.id !== b.dataset.x);
      save();
      render();
    });
    return;
  }

  // Somar progresso numa meta.
  if (b.dataset.m) {
    const m = S.metas[b.dataset.m],
          antes = m.v;
    m.v = Math.min(m.alvo, m.v + m.passo);
    save();
    rMetas();
    rProg();
    if (antes < m.alvo && m.v >= m.alvo) toast(`Meta “${m.n}” concluída! 🎉`);
    return;
  }

  // Remover tarefa.
  if (b.dataset.dt) {
    sair(b.closest('li'), () => {
      S.tarefas.splice(Number(b.dataset.dt), 1);
      save();
      vistos.clear();
      rTarefas();
      rProg();
    });
    return;
  }

  // Remover lembrete.
  if (b.dataset.dl) {
    sair(b.closest('li'), () => {
      S.lemb = S.lemb.filter(l => l.id !== b.dataset.dl);
      save();
      rLemb();
      rProg();
    });
  }
});

// Marcar / desmarcar tarefas e lembretes.
document.addEventListener('change', ev => {

  const c = ev.target;

  if (c.dataset.t !== undefined) {
    S.tarefas[c.dataset.t].f = c.checked ? 1 : 0;
    c.closest('li').classList.toggle('ok', c.checked);
  }
  else if (c.dataset.l) {
    S.lemb.find(l => l.id === c.dataset.l).ok = c.checked ? 1 : 0;
    c.closest('li').classList.toggle('ok', c.checked);
  }
  else return;

  save();
  rProg();
});

// Novo compromisso.
$('#fev').addEventListener('submit', ev => {

  ev.preventDefault();

  const i = toMin($('#ei').value),
        f = toMin($('#ef').value);

  if (i < DI || f > DF) {
    $('#erro').textContent = 'Use horários entre 07:00 e 22:00.';
    return;
  }

  const erro = addEv(dia, $('#et').value.trim(), i, f);

  $('#erro').textContent = erro || '';

  if (!erro) {
    $('#et').value = '';
    toast('Compromisso adicionado');
  }
});

// Nova tarefa.
$('#ftar').addEventListener('submit', ev => {

  ev.preventDefault();

  const t = $('#tt').value.trim();
  if (!t) return;

  S.tarefas.push({ t, f: 0 });
  $('#tt').value = '';
  save();
  rTarefas();
  rProg();
});

// Novo lembrete.
$('#flem').addEventListener('submit', ev => {

  ev.preventDefault();

  const t = $('#lt').value.trim();
  if (!t || !$('#lh').value) return;

  S.lemb.push({ id: uid(), t, h: toMin($('#lh').value), ok: 0 });
  $('#lt').value = '';
  $('#lh').value = '';
  save();
  rLemb();
  rProg();
});


// ======================================
// INÍCIO
// ======================================

render();

// A cada 30 segundos atualiza a linha "agora" e avisa os lembretes na hora certa.
const avisados = new Set();

setInterval(() => {

  rAgenda();

  if ($('#plataforma').style.display !== 'block') return;

  S.lemb.forEach(l => {
    if (!l.ok && l.h === nowMin() && !avisados.has(l.id)) {
      avisados.add(l.id);
      toast('Lembrete: ' + l.t);
    }
  });
}, 30000);


// ======================================
// CADASTRO E LOGIN (LocalStorage)
// ======================================

// Lê o cadastro salvo (ou null se não existir).
function lerCadastro(){

  try{
    return JSON.parse(localStorage.getItem("cadastro"));
  }
  catch{
    return null;
  }
}

// Faz o formulário tremer (feedback de erro).
function tremer(id){

  const f = document.getElementById(id);

  f.classList.remove("treme");
  void f.offsetWidth;
  f.classList.add("treme");
}

// Mostra uma mensagem no elemento indicado (id).
// ok = true deixa o texto verde; false deixa vermelho.
function mostrarMensagem(texto, ok, id){

  const m = document.getElementById(id || "mensagem");

  m.textContent = texto;
  m.className = "msg" + (ok ? " ok" : "");

  if(!ok && texto !== ""){
    tremer(id === "mensagemCad" ? "painelCad" : "painelLogin");
  }
}

function limparMensagens(){

  ["mensagem", "mensagemCad"].forEach(id => {
    const m = document.getElementById(id);
    m.textContent = "";
    m.className = "msg";
  });
}

// Alterna entre as abas "Entrar" e "Criar conta".
function aba(nome){

  const login = nome === "login";

  limparMensagens();

  document.getElementById("painelLogin").hidden = !login;
  document.getElementById("painelCad").hidden = login;

  document.getElementById("abaLogin").setAttribute("aria-selected", login);
  document.getElementById("abaCad").setAttribute("aria-selected", !login);

  document.getElementById("abaLogin").tabIndex = login ? 0 : -1;
  document.getElementById("abaCad").tabIndex = login ? -1 : 0;

  document.getElementById(login ? "loginUsuario" : "cadNome").focus();
}

// Mostrar / ocultar senha.
function togglePw(id, botao){

  const campo = document.getElementById(id);
  const ver = campo.type === "password";

  campo.type = ver ? "text" : "password";
  botao.textContent = ver ? "Ocultar" : "Mostrar";
}

// Medidor de força da senha (0 a 4).
function forca(){

  const s = document.getElementById("cadSenha").value;

  let n =
    (s.length >= 8 ? 1 : 0) +
    (/[a-z]/.test(s) && /[A-Z]/.test(s) ? 1 : 0) +
    (/\d/.test(s) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(s) ? 1 : 0);

  if(s === ""){
    n = 0;
  }
  else if(s.length < 6){
    n = Math.max(1, Math.min(n, 1));
  }
  else{
    n = Math.max(1, n);
  }

  document.getElementById("forca").dataset.n = n;

  document.getElementById("forcaTxt").textContent =
  ["", "Senha fraca", "Senha razoável", "Senha boa", "Senha forte"][n];
}

function cadastrar(){

  let nome =
  document.getElementById("cadNome").value.trim();

  let email =
  document.getElementById("cadEmail").value.trim();

  let usuario =
  document.getElementById("cadUsuario").value.trim();

  let senha =
  document.getElementById("cadSenha").value;

  if(
    nome === "" ||
    email === "" ||
    usuario === "" ||
    senha === ""
  ){

    mostrarMensagem("Preencha todos os campos!", false, "mensagemCad");

  }
  else if(!/^\S+@\S+\.\S+$/.test(email)){

    mostrarMensagem("Digite um e-mail válido!", false, "mensagemCad");

  }
  else{

    let dados = {
      nome: nome,
      email: email,
      usuario: usuario,
      senha: senha
    };

    localStorage.setItem(
      "cadastro",
      JSON.stringify(dados)
    );

    document.getElementById("cadNome").value = "";
    document.getElementById("cadEmail").value = "";
    document.getElementById("cadUsuario").value = "";
    document.getElementById("cadSenha").value = "";
    forca();

    // Leva para o login já com o usuário preenchido.
    aba("login");

    document.getElementById("loginUsuario").value = usuario;

    mostrarMensagem("Cadastro realizado!", true);

    document.getElementById("loginSenha").focus();
  }
}

let entrando = false;

function entrar(){

  if(entrando) return;

  let usuario =
  document.getElementById("loginUsuario").value;

  let senha =
  document.getElementById("loginSenha").value;

  let dados = lerCadastro();

  if(dados === null){

    mostrarMensagem("Realize seu cadastro primeiro!", false);

  }
  else if(
    usuario === dados.usuario &&
    senha === dados.senha
  ){

    mostrarMensagem("Acesso permitido!", true);

    // "Manter conectado": guarda quem está logado.
    if(document.getElementById("manter").checked){
      localStorage.setItem("sessao", dados.usuario);
    }
    else{
      localStorage.removeItem("sessao");
    }

    // Animação de boas-vindas e depois libera a plataforma.
    entrando = true;

    document.getElementById("bvNome").textContent =
    "Olá, " + dados.nome.split(" ")[0] + "!";

    document.getElementById("boasvindas").hidden = false;

    setTimeout(() => {
      mostrarPlataforma(dados);
      entrando = false;
    }, reduz ? 200 : 1100);

  }
  else{

    mostrarMensagem("Usuário ou senha incorretos!", false);
  }
}

// Exibe a plataforma e esconde a tela de acesso.
function mostrarPlataforma(dados){

  document.getElementById("ola").textContent =
  "Olá, " + dados.nome.split(" ")[0];

  document.getElementById("plataforma").style.display =
  "block";

  document.getElementById("acesso").style.display =
  "none";

  document.getElementById("boasvindas").hidden = true;

  rolar();
}

// Botão "Sair": volta para a tela de acesso.
function logout(){

  localStorage.removeItem("sessao");

  document.getElementById("plataforma").style.display =
  "none";

  document.getElementById("acesso").style.display = "";

  document.getElementById("loginUsuario").value = "";
  document.getElementById("loginSenha").value = "";
  document.getElementById("manter").checked = false;

  aba("login");
}

// Aviso de Caps Lock no campo de senha do login.
const campoSenha = document.getElementById("loginSenha");

["keydown", "keyup"].forEach(tipo => {
  campoSenha.addEventListener(tipo, e => {
    document.getElementById("caps").hidden =
    !(e.getModifierState && e.getModifierState("CapsLock"));
  });
});

campoSenha.addEventListener("blur", () => {
  document.getElementById("caps").hidden = true;
});

// Setas esquerda/direita trocam de aba.
document.querySelector(".tabs").addEventListener("keydown", e => {

  if(e.key === "ArrowLeft" || e.key === "ArrowRight"){
    aba(
      document.getElementById("abaLogin").getAttribute("aria-selected") === "true"
        ? "cadastro"
        : "login"
    );
  }
});

// Se marcou "Manter conectado" antes, entra direto.
(function(){

  let dados = lerCadastro();

  if(dados !== null && localStorage.getItem("sessao") === dados.usuario){
    mostrarPlataforma(dados);
  }
  else{
    document.getElementById("loginUsuario").focus();
  }
})();