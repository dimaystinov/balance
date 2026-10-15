from pathlib import Path
import json,zipfile
root=Path(__file__).resolve().parent.parent;p=root/'spacemath'
files=sorted(x.relative_to(p).as_posix() for x in p.rglob('*') if x.is_file() and x.suffix!='.zip' and x.name!='offline-files.json')
(p/'offline-files.json').write_text(json.dumps(files,ensure_ascii=False))
with zipfile.ZipFile(p/'spacemath-offline.zip','w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for x in sorted(p.rglob('*')):
  if x.is_file() and x.suffix!='.zip':z.write(x,'spacemath/'+x.relative_to(p).as_posix())
print('Offline files:',len(files),'ZIP bytes:',(p/'spacemath-offline.zip').stat().st_size)
