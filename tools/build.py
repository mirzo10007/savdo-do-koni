# Builds the single-file app: minify main script with esbuild, wrap as base64 loader, embed seed data.
# usage: python3 tools/build.py [out.html]   (needs esbuild: npm i -g esbuild, or ESBUILD env var)
import subprocess,base64,sys,os,shutil
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(R,'web','Savdo_dokoni.html')
ESB=os.environ.get('ESBUILD') or shutil.which('esbuild') or os.path.join(R,'node_modules','.bin','esbuild')
t=open(os.path.join(R,'src','app.html'),encoding='utf-8').read()
start=t.index('<script>\n(function(){');end=t.index('</script>',start)
js=t[start+len('<script>\n'):end]
tmp=os.path.join(R,'tools','.main.js');open(tmp,'w',encoding='utf-8').write(js)
out=subprocess.run([ESB,tmp,'--minify','--target=chrome100','--charset=utf8','--legal-comments=none'],capture_output=True,text=True,shell=(os.name=='nt'))
os.remove(tmp)
if out.returncode: print(out.stderr);sys.exit(1)
b=base64.b64encode(out.stdout.encode('utf-8')).decode()
loader='<script>(function(){var b="'+b+'",s=atob(b),u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i);(0,Function)(new TextDecoder().decode(u))()})();</script>'
t2=t[:start]+loader+t[end+len('</script>'):]
seed=open(os.path.join(R,'src','seed.json'),encoding='utf-8').read().replace('</','<\\/')
t2=t2.replace('/*SEED*/null',seed)
os.makedirs(os.path.dirname(OUT),exist_ok=True)
open(OUT,'w',encoding='utf-8').write(t2)
print('built',OUT,len(t2))
