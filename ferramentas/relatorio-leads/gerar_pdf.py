#!/usr/bin/env python3
"""Gera o PDF "Leads para atendimento ativo" do PRO IMOBILIÁRIA (mesmo modelo do relatório de 22/10/2026).

Uso:  python3 gerar_pdf.py lista.json saida.pdf

lista.json:
{
  "data": "2026-10-30",                 # dia da lista (AAAA-MM-DD)
  "conferido": "29/10/2026",            # quando os anúncios foram conferidos no ar
  "leads": [
    {"prioridade": 1,                   # 1 = proprietário confirmado pelo texto; 2 = confirmar na 1ª mensagem
     "nome": "Daniel", "cidade": "Novo Hamburgo", "bairro": "Boa Saúde (Rua das Quaresmeiras)",
     "quer": "Venda",                   # Venda | Aluguel | Compra | Locação (inquilino)
     "intencao": "Vender a casa por R$ 130 mil, somente à vista.",
     "whatsapp": "(51) 98107-0093", "publicado": "20/10/2026",
     "link": "https://...", "verificacao": "Nome e WhatsApp escritos pelo próprio anunciante; ...",
     "mensagem": "Olá, Daniel, tudo bem?\n\nAqui é o corretor [NOME DO CORRETOR], da Innovar Imobiliária, ...\n\nSe não for o momento, é só me avisar que eu não te chamo de novo."}
  ]
}
Requer Playwright (python) com Chromium.
"""
import html, json, sys

def e(s): return html.escape(str(s or ''))

def dbr(iso):
    p = str(iso).split('-')
    return f"{p[2]}/{p[1]}/{p[0]}" if len(p) == 3 else str(iso)

CSS = """
@page{size:A4;margin:14mm 12mm 16mm}
*{box-sizing:border-box}body{font-family:'DejaVu Sans',Arial,sans-serif;color:#0b1b3f;font-size:10.5pt;margin:0}
.capa{background:#1c3087;color:#fff;border-radius:10px;padding:16px 20px}
.capa .k{letter-spacing:3px;font-size:8.5pt;font-weight:700;opacity:.85;margin:0}
.capa h1{font-size:22pt;margin:4px 0 6px}.capa p{margin:2px 0;font-size:9.5pt}.capa .sub{opacity:.85}
.kpis{display:flex;gap:8px;margin:12px 0}.kpi{flex:1;border:1px solid #c9d3ea;border-radius:8px;padding:8px 10px}
.kpi b{display:block;font-size:20pt;color:#1c3087}.kpi span{font-size:8.5pt;color:#51607d}
h2{color:#1c3087;font-size:13pt;margin:16px 0 6px;border-bottom:2px solid #1c3087;padding-bottom:3px}
ul.reg{margin:4px 0 0 0;padding-left:18px;font-size:9.5pt}ul.reg li{margin:2px 0}
table{width:100%;border-collapse:collapse;font-size:8.6pt}th{background:#1c3087;color:#fff;text-align:left;padding:5px}
td{padding:5px;border-bottom:1px solid #dfe5f2;vertical-align:top}td small{color:#51607d}
tr.grp td{background:#e8eefa;font-weight:700;color:#1c3087}tr.grp2 td{background:#fff4e0;color:#8a5a00}
.card{border:1px solid #c9d3ea;border-left:5px solid #1c3087;border-radius:8px;padding:10px 12px;margin:0 0 12px;page-break-inside:avoid}
.card.p2{border-left-color:#e98018}
.ch{display:flex;justify-content:space-between;align-items:flex-start}.num{background:#1c3087;color:#fff;border-radius:5px;padding:2px 7px;font-weight:700;margin-right:8px}
.nm{font-size:12.5pt;font-weight:700}.loc{color:#51607d;font-size:9pt;margin-left:34px}
.tag{font-size:8pt;font-weight:700;border-radius:10px;padding:2px 9px;background:#e8eefa;color:#1c3087}.tag.al{background:#fff4e0;color:#8a5a00}
dl{display:grid;grid-template-columns:105px 1fr;gap:3px 8px;margin:8px 0;font-size:9pt}dt{font-weight:700;color:#1c3087}dd{margin:0;overflow-wrap:anywhere}
dd a{color:#0b5fcb}.msgt{font-size:8pt;font-weight:700;letter-spacing:1.5px;color:#1c3087;margin:6px 0 4px;border-top:1px solid #1c3087;padding-top:6px}
.msg{background:#f1f5fc;border:1px solid #dfe5f2;border-radius:6px;padding:8px 10px;white-space:pre-wrap;font-size:9.2pt;line-height:1.45}
.nota{background:#fff4e0;border:1px solid #f0c27a;border-radius:6px;padding:8px 10px;font-size:9pt;margin-top:8px}
.pb{page-break-before:always}
"""

def montar(d):
    L = d['leads']; dia = dbr(d['data'])
    p1 = [x for x in L if int(x.get('prioridade', 2)) == 1]; p2 = [x for x in L if int(x.get('prioridade', 2)) != 1]
    ordem = p1 + p2
    for i, x in enumerate(ordem, 1): x['_n'] = f"{i:02d}"
    cidades = sorted({x['cidade'] for x in L if x.get('cidade')})
    def linha(x):
        return (f"<tr><td>{x['_n']}</td><td>{e(x['nome'])}</td><td>{e(x['cidade'])}<br><small>{e(x.get('bairro'))}</small></td>"
                f"<td>{e(x.get('quer'))}</td><td>{e(x.get('intencao'))}</td><td style='white-space:nowrap'>{e(x.get('whatsapp'))}</td><td></td></tr>")
    tab = ''
    if p1: tab += '<tr class="grp"><td colspan="7">Prioridade 1 · proprietário confirmado pelo texto do anúncio</td></tr>' + ''.join(linha(x) for x in p1)
    if p2: tab += '<tr class="grp grp2"><td colspan="7">Prioridade 2 · confirmar na 1ª mensagem se é o proprietário</td></tr>' + ''.join(linha(x) for x in p2)
    def card(x):
        al = x.get('quer') in ('Aluguel', 'Locação (inquilino)')
        return (f"<div class='card {'p2' if int(x.get('prioridade',2))!=1 else ''}'><div class='ch'><div><span class='num'>{x['_n']}</span>"
                f"<span class='nm'>{e(x['nome'])}</span><div class='loc'>{e(x['cidade'])} · {e(x.get('bairro'))}</div></div>"
                f"<span class='tag {'al' if al else ''}'>{e(x.get('quer'))}</span></div>"
                f"<dl><dt>Intenção</dt><dd>{e(x.get('intencao'))}</dd><dt>WhatsApp</dt><dd><b>{e(x.get('whatsapp'))}</b> (publicado pelo próprio anunciante)</dd>"
                f"<dt>Publicado em</dt><dd>{e(x.get('publicado'))}</dd><dt>Link de origem</dt><dd><a href='{e(x.get('link'))}'>{e(x.get('link'))}</a></dd>"
                f"<dt>Verificação</dt><dd>{e(x.get('verificacao'))}</dd><dt>Corretor</dt><dd>______________________________</dd></dl>"
                f"<div class='msgt'>MENSAGEM DE PRIMEIRO CONTATO</div><div class='msg'>{e(x.get('mensagem'))}</div></div>")
    cards = ''
    if p1: cards += "<h2 class='pb'>Prioridade 1 · proprietário confirmado pelo texto</h2>" + ''.join(card(x) for x in p1)
    if p2: cards += f"<h2 {'class=pb' if not p1 else ''}>Prioridade 2 · confirmar na 1ª mensagem se é o proprietário</h2>" + ''.join(card(x) for x in p2)
    wa = sum(1 for x in L if x.get('whatsapp'))
    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório de leads · {dia}</title><style>{CSS}</style></head><body>
<div class="capa"><p class="k">RELATÓRIO DE LEADS · {dia}</p><h1>Leads para atendimento ativo</h1>
<p>De: <b>Corretor Anderson Alves</b> · Para: direção e equipe de corretores da Innovar Imobiliária</p>
<p class="sub">{len(L)} contatos do dia, levantados e verificados pelo app PRO IMOBILIÁRIA, prontos para distribuição.</p></div>
<div class="kpis"><div class="kpi"><b>{len(L)}</b><span>leads do dia</span></div><div class="kpi"><b>{len(p1)}</b><span>proprietário confirmado pelo texto</span></div>
<div class="kpi"><b>{len(p2)}</b><span>confirmar na 1ª mensagem</span></div><div class="kpi"><b>{wa}</b><span>com WhatsApp direto</span></div></div>
<h2>Como estes leads foram selecionados</h2><ul class="reg">
<li>Pessoas que querem vender, comprar ou alugar imóvel na região ({e(', '.join(cidades))}).</li>
<li>Somente quem anuncia o próprio imóvel ou procura imóvel para si. Corretores, imobiliárias e construtoras ficam de fora.</li>
<li>Somente contato direto: WhatsApp publicado pela própria pessoa. Nada de portais que exigem cadastro.</li>
<li>Nenhum destes contatos saiu em lista anterior: o app bloqueia telefone e anúncio já entregues.</li>
<li>Cada anúncio foi conferido no ar em {e(d.get('conferido') or dia)}.</li></ul>
<h2>Resumo para distribuição</h2>
<table><thead><tr><th>#</th><th>Lead</th><th>Cidade</th><th>Quer</th><th>Intenção</th><th>WhatsApp</th><th>Corretor</th></tr></thead><tbody>{tab}</tbody></table>
<h2>Como abordar</h2><ul class="reg">
<li>Cada corretor se identifica pelo próprio nome no lugar de <b>[NOME DO CORRETOR]</b> (ex.: “Aqui é o corretor Fulano, da Innovar Imobiliária”).</li>
<li>Prioridade 2: começar perguntando se a pessoa é a proprietária. Se for corretor ou imobiliária, agradecer e encerrar.</li>
<li>Um lead, um corretor: anote o nome na coluna Corretor e não repasse o contato para outra pessoa.</li>
<li>Se a pessoa pedir para não ser contatada, registrar e não insistir.</li>
<li>Devolver ao Corretor Anderson Alves o resultado de cada contato (respondeu, interesse, próximo passo).</li></ul>
{cards}
</body></html>"""

def main():
    d = json.load(open(sys.argv[1], encoding='utf-8')); out = sys.argv[2]
    page_html = montar(d)
    open(out.rsplit('.', 1)[0] + '.html', 'w', encoding='utf-8').write(page_html)
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.set_content(page_html, wait_until='load')
        dia = dbr(d['data'])
        pg.pdf(path=out, format='A4', print_background=True, display_header_footer=True,
               header_template='<span></span>',
               footer_template=f'<div style="font-size:7px;color:#51607d;width:100%;text-align:center">Corretor Anderson Alves · Relatório de leads {dia} · página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
               margin={'top': '14mm', 'bottom': '16mm', 'left': '12mm', 'right': '12mm'})
        b.close()
    print(out)

if __name__ == '__main__':
    main()
