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
 'company': {'en':'company/','fr':'fr/societe/','es':'es/empresa/'}
}
CATALOG = json.loads((ROOT/'i18n/translations.json').read_text())
LOOKUP = {BASE+r['en']: k for k,r in ROUTES.items()}
LABELS = {'en':'Choose language','fr':'Choisir la langue','es':'Elegir idioma'}

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
    s.head.append(s.new_tag('link',rel='stylesheet',href=PREFIX+'locale.css?v=20261016'))
    selector=s.new_tag('div',attrs={'class':'language-switch','role':'group','aria-label':LABELS[lang],'data-i18n-ui':'languages'})
    for other,name in [('en','English'),('fr','Français'),('es','Español')]:
        link=s.new_tag('a',href=PREFIX+ROUTES[key][other]+'?lang='+other,hreflang=other,lang=other,attrs={'data-language':other,'aria-label':name})
        link.string=other.upper()
        if lang==other:link['aria-current']='true'
        selector.append(link)
    s.select_one('header.header').append(selector)
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
    print('Built 30 static pages, reciprocal language alternatives and multilingual sitemaps.')

if __name__=='__main__':main()
