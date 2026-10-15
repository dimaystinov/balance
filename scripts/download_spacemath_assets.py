"""Download only image URLs observed in captured article DOM, never HTML pages."""
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor,as_completed
import json,hashlib,time
root=Path(__file__).resolve().parent.parent
urls=set()
for p in (root/'source-materials').glob('[0-9]*.json'):
 for img in BeautifulSoup(json.loads(p.read_text())['html'],'html.parser').find_all('img'):
  if img.get('src'):urls.add(img['src'])
def local(u):
 suffix=Path(urlparse(u).path).suffix.lower()
 if suffix not in ['.png','.jpg','.jpeg','.gif','.webp','.svg']:suffix='.png'
 return 'assets/'+hashlib.sha256(u.encode()).hexdigest()[:24]+suffix
mapping={u:local(u) for u in sorted(urls)}
(root/'source-materials/assets.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2))
def download(item):
 u,rel=item;p=root/'spacemath'/rel
 if p.exists() and p.stat().st_size:return
 if urlparse(u).hostname!='spacemath.xyz':raise ValueError('Unexpected host')
 for attempt in range(3):
  try:
   with urlopen(Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=30) as r:
    if not r.headers.get('Content-Type','').startswith('image/'):raise ValueError('Not an image')
    data=r.read()
   p.write_bytes(data);return
  except Exception as e:
   if attempt==2:return {'url':u,'error':str(e)}
   time.sleep(1+attempt)
errors=[]
with ThreadPoolExecutor(max_workers=8) as pool:
 for i,f in enumerate(as_completed(pool.submit(download,x) for x in mapping.items()),1):
  error=f.result()
  if error:errors.append(error)
  if i%250==0:print(i,'/',len(mapping),flush=True)
(root/'source-materials/download-errors.json').write_text(json.dumps(errors,ensure_ascii=False,indent=2))
print('Images',len(mapping),'errors',len(errors),'bytes',sum(p.stat().st_size for p in (root/'spacemath/assets').iterdir()),flush=True)
