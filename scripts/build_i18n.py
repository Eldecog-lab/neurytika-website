"""Build static French/Spanish pages from the English site and reviewed catalog.

Run from any directory: python3 scripts/build_i18n.py
Requires beautifulsoup4. English pages remain the source of truth.
"""
from pathlib import Path
from bs4 import BeautifulSoup, Comment, Doctype
from urllib.parse import urljoin, urlsplit, urlunsplit
import json, re, posixpath
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://eldecog-lab.github.io/neurytika-website/'
PREFIX = '/neurytika-website/'
ROUTES = {
 'home': {'en':'','fr':'fr/','es':'es/'},
 'customer-retention': {'en':'customer-retention/','fr':'fr/fidelisation-clients/','es':'es/fidelizacion-clientes/'},
 'lead-qualification': {'en':'lead-qualification/','fr':'fr/qualification-prospects/','es':'es/calificacion-leads/'},
 'quality-control': {'en':'quality-control/','fr':'fr/controle-qualite/','es':'es/control-calidad/'},
 'fraud-detection': {'en':'fraud-detection/','fr':'fr/detection-fraude/','es':'es/deteccion-fraude/'},
 'predictive-analytics': {'en':'predictive-analytics/','fr':'fr/analyse-predictive/','es':'es/analitica-predictiva/'},
 'on-premise-ai': {'en':'on-premise-ai/','fr':'fr/ia-sur-site/','es':'es/ia-local/'},
 'data-sovereignty-ai': {'en':'data-sovereignty-ai/','fr':'fr/souverainete-donnees-ia/','es':'es/soberania-datos-ia/'},
 'generative-ai-vs-predictive-ai': {'en':'generative-ai-vs-predictive-ai/','fr':'fr/ia-generative-vs-ia-predictive/','es':'es/ia-generativa-vs-ia-predictiva/'},
 'embedded-ai-aerospace': {'en':'embedded-ai-aerospace/','fr':'fr/ia-embarquee-aeronautique-spatial/','es':'es/ia-embarcada-aeroespacial/'},
 'company': {'en':'company/','fr':'fr/societe/','es':'es/empresa/'},
 'quiz': {'en':'find-your-ai/','fr':'fr/trouver-votre-solution/','es':'es/encuentre-su-solucion/'}
}
CATALOG = json.loads((ROOT/'i18n/translations.json').read_text())
LOOKUP = {BASE+r['en']: k for k,r in ROUTES.items()}
LABELS = {'en':'Choose language','fr':'Choisir la langue','es':'Elegir idioma'}
QUIZ_CTA={
 'en':('Find your AI fit','Not sure where to start?','Five simple questions. A tailored recommendation for your next project.','Take the 2-min quiz'),
 'fr':('Trouvez votre solution IA','Par où commencer ?','Cinq questions simples. Une recommandation personnalisée pour votre prochain projet.','Faire le quiz de 2 min'),
 'es':('Encuentre su solución de IA','¿Por dónde empezar?','Cinco preguntas sencillas. Una recomendación personalizada para su próximo proyecto.','Hacer el quiz de 2 min')
}
DIRECTORY = {
 'en': {'label':'Explore Neurytika','groups':[
  ('Business solutions',[('customer-retention','Customer retention'),('lead-qualification','Lead qualification'),('quality-control','Quality control'),('fraud-detection','Fraud detection'),('predictive-analytics','Predictive analytics & consulting')]),
  ('Deployment & AI',[('on-premise-ai','On-premise AI'),('data-sovereignty-ai','Data sovereignty & AI'),('generative-ai-vs-predictive-ai','Generative AI vs predictive AI'),('embedded-ai-aerospace','Embedded AI for aerospace')]),
  ('Neurytika',[('home','Home'),('company','Celeste EcoFlyers — About us'),('home#publication','Research & scientific evidence'),('home#academic','Academic access'),('home#contact','Contact & demo')])]},
 'fr': {'label':'Explorer Neurytika','groups':[
  ('Solutions métier',[('customer-retention','Fidélisation clients'),('lead-qualification','Qualification des prospects'),('quality-control','Contrôle qualité'),('fraud-detection','Détection de fraude'),('predictive-analytics','Analyse prédictive et conseil')]),
  ('Déploiement et IA',[('on-premise-ai','IA sur site'),('data-sovereignty-ai','Souveraineté des données et IA'),('generative-ai-vs-predictive-ai','IA générative et IA prédictive'),('embedded-ai-aerospace','IA embarquée pour l’aérospatial')]),
  ('Neurytika',[('home','Accueil'),('company','Celeste EcoFlyers — Notre société'),('home#publication','Recherche et résultats scientifiques'),('home#academic','Accès académique'),('home#contact','Contact et démonstration')])]},
 'es': {'label':'Explorar Neurytika','groups':[
  ('Soluciones empresariales',[('customer-retention','Fidelización de clientes'),('lead-qualification','Calificación de leads'),('quality-control','Control de calidad'),('fraud-detection','Detección de fraude'),('predictive-analytics','Analítica predictiva y consultoría')]),
  ('Despliegue e IA',[('on-premise-ai','IA local'),('data-sovereignty-ai','Soberanía de datos e IA'),('generative-ai-vs-predictive-ai','IA generativa e IA predictiva'),('embedded-ai-aerospace','IA embarcada aeroespacial')]),
  ('Neurytika',[('home','Inicio'),('company','Celeste EcoFlyers — Nuestra empresa'),('home#publication','Investigación y evidencia científica'),('home#academic','Acceso académico'),('home#contact','Contacto y demostración')])]}
}

def translated(value, lang):
    core = value.strip()
    if lang == 'en' or core not in CATALOG:
        return value
    return value[:len(value)-len(value.lstrip())] + CATALOG[core][lang] + value[len(value.rstrip()):]

def mapped_url(value, original, lang):
    if value.startswith('#'):
        return value
    absolute = urljoin(original, value)
    p = urlsplit(absolute)
    clean = urlunsplit((p.scheme,p.netloc,p.path,'',''))
    key = LOOKUP.get(clean.removesuffix('index.html'))
    if key:
        target = urlsplit(BASE+ROUTES[key][lang])
        return urlunsplit(('', '', target.path,p.query,p.fragment))
    if absolute.startswith(BASE) and not value.startswith(('https://','http://')):
        return urlunsplit(('', '', p.path,p.query,p.fragment))
    return value

def schema_walk(v, original, lang, key=''):
    if isinstance(v,dict):
        return {k:schema_walk(x,original,lang,k) for k,x in v.items()}
    if isinstance(v,list):
        return [schema_walk(x,original,lang,key) for x in v]
    if isinstance(v,str):
        if key == 'inLanguage': return lang
        if key in ['name','description','headline','serviceType']: return translated(v,lang)
        if v.startswith(BASE):
            mapped = mapped_url(v,original,lang)
            return urljoin(BASE,mapped)
    return v

def clean_generated(s):
    for n in s.select('[data-i18n-ui],link[hreflang]'): n.decompose()
    for n in s.select('script[src],link[rel="stylesheet"]'):
        if any(x in n.get('src',n.get('href','')) for x in ['locale.js','locale.css']): n.decompose()

def build_page(key,source,lang):
    s=BeautifulSoup(source,'html.parser');clean_generated(s)
    original=BASE+ROUTES[key]['en'];target=BASE+ROUTES[key][lang]
    for n in list(s.find_all(string=True)):
        if not isinstance(n,(Comment,Doctype)) and n.parent.name not in ['script','style']:
            n.replace_with(translated(str(n),lang))
    for n in s.find_all(True):
        for attr in ['alt','aria-label','placeholder','title']:
            if n.has_attr(attr):n[attr]=translated(n[attr],lang)
        if n.name=='meta' and (n.get('name')=='description' or n.get('property') in ['og:title','og:description','og:image:alt']):
            n['content']=translated(n.get('content',''),lang)
        for attr in ['href','src','poster']:
            if n.has_attr(attr): n[attr]=mapped_url(n[attr],original,lang)
    s.html['lang']=lang;s.html['data-page-key']=key
    s.find('link',rel='canonical')['href']=target
    og=s.find('meta',property='og:url')
    if og:og['content']=target
    og=s.find('meta',property='og:locale')
    if og:og['content']={'en':'en_GB','fr':'fr_FR','es':'es_ES'}[lang]
    for n in s.find_all('script',type='application/ld+json'):
        n.string=json.dumps(schema_walk(json.loads(n.string),original,lang),ensure_ascii=False)
    for other in ['en','fr','es','x-default']:
        n=s.new_tag('link',rel='alternate',hreflang=other,href=BASE+ROUTES[key]['en' if other=='x-default' else other]);s.head.append(n)
    script=s.new_tag('script',src=PREFIX+'locale.js?v=20261016');s.head.insert(1,script)
    s.head.append(s.new_tag('link',rel='stylesheet',href=PREFIX+'locale.css?v=20261016-2'))
    s.head.append(s.new_tag('link',rel='stylesheet',href=PREFIX+'analytics.css?v=20261016-1',attrs={'data-i18n-ui':'audience-style'}))
    s.head.append(s.new_tag('script',src=PREFIX+'analytics.js?v=20261016-1',defer='',attrs={'data-i18n-ui':'audience-script'}))
    s.head.append(s.new_tag('script',src=PREFIX+'demo-form.js?v=20261016-1',defer='',attrs={'data-i18n-ui':'demo-script'}))
    selector=s.new_tag('div',attrs={'class':'language-switch','role':'group','aria-label':LABELS[lang],'data-i18n-ui':'languages'})
    for other,name in [('en','English'),('fr','Français'),('es','Español')]:
        link=s.new_tag('a',href=PREFIX+ROUTES[key][other]+'?lang='+other,hreflang=other,lang=other,attrs={'data-language':other,'aria-label':name})
        link.string=other.upper()
        if lang==other:link['aria-current']='true'
        selector.append(link)
    s.select_one('header.header').append(selector)
    quiz_href=PREFIX+ROUTES['quiz'][lang]
    quiz_nav=s.new_tag('a',href=quiz_href,attrs={'data-i18n-ui':'quiz-nav'});quiz_nav.string=QUIZ_CTA[lang][0]
    if key=='quiz':quiz_nav['aria-current']='page'
    s.select_one('header.header nav').append(quiz_nav)
    # Route data is public; no contact data or receiving email appears in HTML.
    if key=='quiz':
        data=s.new_tag('script',type='application/json',id='quiz-routes',attrs={'data-i18n-ui':'quiz-routes'})
        data.string=json.dumps(ROUTES,ensure_ascii=False);s.body.append(data)
    else:
        if key=='home':
            action=s.select_one('.hero .actions .text-link')
            if action:action['href']=quiz_href;action.string=QUIZ_CTA[lang][3]+' →'
        s.head.append(s.new_tag('link',rel='stylesheet',href=PREFIX+'quiz.css?v=20261016-3',attrs={'data-i18n-ui':'quiz-style'}))
        banner=BeautifulSoup('<aside class="wrap quiz-banner" data-i18n-ui="quiz-banner"><div class="quiz-banner-inner"><div class="quiz-banner-copy"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="32" cy="32" r="26"/><path d="m44 18-7 23-18 6 7-23z"/></svg><div><h2></h2><p></p></div></div><a class="button"></a></div></aside>','html.parser').aside
        banner.h2.string=QUIZ_CTA[lang][1];banner.p.string=QUIZ_CTA[lang][2];banner.a.string=QUIZ_CTA[lang][3]+' ↗';banner.a['href']=quiz_href
        contact=s.select_one('section.contact')
        if contact:contact.insert_before(banner)
        else:s.main.append(banner)
    directory=s.new_tag('nav',attrs={'id':'site-directory','class':'wrap site-directory','aria-label':DIRECTORY[lang]['label'],'data-i18n-ui':'directory'})
    for heading,items in DIRECTORY[lang]['groups']:
        group=s.new_tag('div');title=s.new_tag('h2');title.string=heading;group.append(title)
        items_list=s.new_tag('ul')
        for dest,label in items:
            target_key,_,fragment=dest.partition('#')
            href=PREFIX+ROUTES[target_key][lang]+(('#'+fragment) if fragment else '')
            li=s.new_tag('li');link=s.new_tag('a',href=href);link.string=label
            if target_key==key and not fragment:link['aria-current']='page'
            li.append(link);items_list.append(li)
        if heading=='Neurytika':
            li=s.new_tag('li');a=s.new_tag('a',href=quiz_href);a.string=QUIZ_CTA[lang][0];li.append(a);items_list.append(li)
        group.append(items_list);directory.append(group)
    s.select_one('footer.footer').insert_before(directory)
    out=ROOT/ROUTES[key][lang]/'index.html';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(str(s)+'\n')

def main():
    sources={k:(ROOT/v['en']/'index.html').read_text() for k,v in ROUTES.items()}
    for key,source in sources.items():
        for lang in ['en','fr','es']:build_page(key,source,lang)
    # The route table is shared by the selector, redirects and the static build.
    (ROOT/'i18n/routes.json').write_text(json.dumps(ROUTES,ensure_ascii=False,indent=2)+'\n')
    js=(ROOT/'scripts/locale.template.js').read_text().replace('__ROUTES__',json.dumps(ROUTES,separators=(',',':')))
    (ROOT/'locale.js').write_text(js)
    ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    ET.register_namespace('xhtml','http://www.w3.org/1999/xhtml')
    ns='{http://www.sitemaps.org/schemas/sitemap/0.9}';xh='{http://www.w3.org/1999/xhtml}'
    root=ET.Element(ns+'urlset');urls=[]
    for route in ROUTES.values():
        for lang in ['en','fr','es']:
            url=ET.SubElement(root,ns+'url');loc=BASE+route[lang];urls.append(loc);ET.SubElement(url,ns+'loc').text=loc
            for other in ['en','fr','es','x-default']:
                ET.SubElement(url,xh+'link',rel='alternate',hreflang=other,href=BASE+route['en' if other=='x-default' else other])
    ET.indent(root)
    xml='<?xml version="1.0" encoding="utf-8"?>\n'+ET.tostring(root,encoding='unicode')+'\n'
    for name in ['sitemap.xml','sitemap-pages.xml']:(ROOT/name).write_text(xml)
    (ROOT/'sitemap.txt').write_text('\n'.join(urls)+'\n')
    print(f'Built {len(ROUTES)*3} static pages, reciprocal language alternatives and multilingual sitemaps.')

if __name__=='__main__':main()
