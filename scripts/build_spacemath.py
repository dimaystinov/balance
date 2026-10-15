"""Build static lessons from browser-captured DOM. No network or remote scripts."""
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlparse,urljoin,urldefrag
import json,re,html
root=Path(__file__).resolve().parent.parent;out=root/'spacemath';source=root/'source-materials'
index=json.loads((source/'index.json').read_text());assets={u.strip():p for u,p in json.loads((source/'assets.json').read_text()).items()}
assets['https://spacemath.xyz/wp-content/uploads/2017/08/vzaimno-obratnye-operatsii-umnozhenie-i-delenie.png']='assets/reciprocal-operations.svg'
links={urldefrag(x['url'])[0]:f'lesson-{i+1:02}.html' for i,x in enumerate(index)}
nums={'одна':1,'две':2,'три':3,'четыре':4,'пять':5,'шесть':6,'семь':7,'восемь':8,'девять':9,'десять':10}
dens={'вторая':2,'вторых':2,'третья':3,'третьих':3,'четвертая':4,'четвертых':4,'пятая':5,'пятых':5,'шестая':6,'шестых':6,'седьмая':7,'седьмых':7,'восьмая':8,'восьмых':8,'девятая':9,'девятых':9,'десятая':10,'десятых':10,'сотая':100,'сотых':100}
conversions=[];audit=[]
def formula(alt):
 words=alt.lower().replace('ё','е').strip().split();negative=words[:1]==['минус']
 if negative:words=words[1:]
 if len(words)==2 and words[0] in nums and words[1] in dens:return ('-' if negative else '')+r'\frac{'+str(nums[words[0]])+'}{'+str(dens[words[1]])+'}'
 if re.fullmatch(r'-?\d+\s*/\s*[1-9]\d*',alt):
  a,b=alt.split('/');return r'\frac{'+a.strip()+'}{'+b.strip()+'}'
 return None
nav=''.join(f'<li><a href="lesson-{i+1:02}.html">{html.escape(x["title"])}</a></li>' for i,x in enumerate(index))
def shell(title,body,number=0):
 return f'''<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#326c9c"><title>{html.escape(title)} — Математика с нуля</title><link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon.svg"><link rel="stylesheet" href="style.css"><link rel="stylesheet" href="vendor/katex/katex.min.css"><script defer src="vendor/katex/katex.min.js"></script><script defer src="vendor/katex/contrib/auto-render.min.js"></script><script defer src="engine.js"></script><script defer src="quiz-bank.js"></script><script defer src="app.js"></script></head><body data-lesson="{number}"><header><a href="index.html">Математика с нуля</a><button id="menu" aria-controls="sidebar" aria-expanded="false">Шаги</button><button id="settings-open">Настройки</button></header><div class="layout"><aside id="sidebar"><p id="overall"></p><nav aria-label="Шаги курса"><ol>{nav}</ol></nav></aside><main id="main"><h1>{html.escape(title)}</h1>{body}</main></div><dialog id="settings"><h2>Настройки</h2><h3>Приложение</h3><button id="install" hidden>Установить приложение</button><p id="install-help"></p><button id="download">Скачать весь курс</button><progress id="download-progress" value="0" max="1" hidden></progress><p id="offline-status" role="status"></p><p><a href="spacemath-offline.zip" download>Скачать ZIP-копию для другого компьютера</a></p><h3>Прогресс</h3><button id="export">Сохранить прогресс</button><label>Восстановить прогресс <input id="import" type="file" accept="application/json"></label><details><summary>Начать заново</summary><p>Очистятся ответы и отметки. Уроки и картинки останутся для следующего ученика.</p><button id="reset">Очистить мой прогресс</button></details><p id="settings-status" role="status"></p><form method="dialog"><button>Закрыть</button></form></dialog><footer>Материалы: <a href="https://spacemath.xyz/">Spacemath</a>. Локальная учебная копия с тестами.</footer></body></html>'''
for i,item in enumerate(index,1):
 data=json.loads((source/f'{i:02}.json').read_text());soup=BeautifulSoup(data['html'],'html.parser')
 # Remove the source site's social-group promotion from every lesson.
 for node in list(soup.find_all(['strong','b'])):
  text=node.get_text(' ',strip=True)
  if 'Понравился урок?' in text and 'Вступай в нашу новую группу' in text:
   node.decompose()
 # Preserve original reveal-answer controls as native, offline details.
 for a in list(soup.select('a.show_hide')):
  selector=' '.join(a.get('rel',[]))
  if not re.fullmatch(r'\.[a-zA-Z0-9_-]+',selector):continue
  target=soup.select_one(selector)
  if target is None:continue
  details=soup.new_tag('details');summary=soup.new_tag('summary');summary.string=a.get_text(strip=True) or 'Показать решение';details.append(summary);details.append(target.extract())
  a.parent.replace_with(details)
 for node in list(soup.select('script,style,iframe,form,input,button,object,embed,link,meta,[id^="yandex"],[id^="ya-"]')):node.decompose()
 for node in list(soup.find_all()):
  if not node.name:continue
  if node.name not in {'p','div','span','br','hr','h1','h2','h3','h4','h5','h6','strong','b','em','i','u','s','ul','ol','li','table','thead','tbody','tfoot','tr','td','th','sub','sup','a','img','blockquote','pre','code','figure','figcaption','details','summary','section','article'}:node.unwrap();continue
  allowed={'id','title','alt','width','height','colspan','rowspan','start','type'}
  if node.name=='a':allowed.add('href')
  if node.name=='img':allowed.add('src')
  for attr in list(node.attrs):
   if attr not in allowed:del node[attr]
  if node.name=='img':
   u=urljoin(item['url'],node.get('src','').strip());alt=node.get('alt','');tex=formula(alt)
   if tex:
    replacement=soup.new_tag('span');replacement['class']='formula';replacement['data-tex']=tex;replacement.string=r'\('+tex+r'\)';node.replace_with(replacement);conversions.append({'lesson':i,'image':u,'latex':tex,'basis':'exact alt text'});continue
   if u in assets:node['src']=assets[u];node['loading']='lazy';node['decoding']='async'
   else:raise ValueError('Unmapped image '+u)
  if node.name=='a':
   href=node.get('href','');absolute=urljoin(item['url'],href);base,fragment=urldefrag(absolute)
   if base in links:node['href']=links[base]+('#'+fragment if fragment else '')
   elif base.rstrip('/')=='https://spacemath.xyz':node['href']='index.html'
   elif base in assets:node['href']=assets[base]
   elif href.startswith('#'):pass
   elif absolute.startswith(('https://','http://')):node['href']=absolute;node['rel']='noopener noreferrer'
   else:node.attrs.pop('href',None)
 # Convert standalone unambiguous text formulas. Preserve prose and diagrams.
 for p in soup.find_all(['p']):
  if p.find(['img','a','div','table']):continue
  text=p.get_text().strip()
  if len(text)<3 or len(text)>180 or not re.search(r'[=<>+−×÷*/]',text) or re.search(r'[^0-9a-zA-Zα-ωΑ-Ω\s.,=<>+−×÷*/():^–—−-]',text):continue
  if re.search(r'[a-zA-Z]{3,}',text):continue
  tex=text.replace('−','-').replace('×',r'\times ').replace('÷',r'\div ').replace('·',r'\cdot ')
  if p.find(['sup','sub']):continue
  p.clear();p['class']='formula';p['data-tex']=tex;p.string=r'\['+tex+r'\]';conversions.append({'lesson':i,'text':text,'latex':tex,'basis':'literal math-only paragraph'})
 article=str(soup)
 prev=f'<a href="lesson-{i-1:02}.html">← Предыдущий шаг</a>' if i>1 else '<a href="index.html">Все шаги</a>'
 nxt=f'<a href="lesson-{i+1:02}.html">Следующий шаг →</a>' if i<75 else '<a href="index.html">Все шаги</a>'
 body=f'<p class="origin"><a href="{html.escape(item["url"])}">Оригинал урока</a> · <a href="#quiz">К тесту</a></p><article class="lesson-text">{article}</article><section id="quiz" aria-label="Тест к уроку"></section><div class="next">{prev}{nxt}</div>'
 (out/f'lesson-{i:02}.html').write_text(shell(item['title'],body,i))
 audit.append({'lesson':i,'source':item['url'],'source_text_chars':len(data['text']),'local_text_chars':len(soup.get_text()),'images':len(soup.find_all('img'))})
body=f'<p>75 уроков в исходном порядке. Полный текст, иллюстрации и тест после каждого урока.</p><p><a class="start" href="lesson-01.html">Начать с первого шага →</a></p><p>Для занятий без интернета откройте настройки и выберите «Скачать весь курс».</p><ol class="contents">{nav}</ol>'
(out/'index.html').write_text(shell('Математика с нуля',body))
(source/'formula-conversions.json').write_text(json.dumps(conversions,ensure_ascii=False,indent=2))
(source/'copy-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2))
print('Built',len(audit),'lessons; converted formulas',len(conversions))
