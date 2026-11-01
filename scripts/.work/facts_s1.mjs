import fs from 'fs';
const c=JSON.parse(fs.readFileSync('scripts/.work/candidates.json','utf8'))[+process.argv[2]];
const t=fs.readFileSync(c.file,'utf8');
console.log(c.slug,c.category,c.title);
const m=t.match(/export const products[\s\S]*$/)[0];
for(const b of m.split(/\n  \{\n/).slice(1)){
 const g=r=>(b.match(r)||[])[1];
 console.log('--',g(/name: "(.*?)"/),'|',(g(/dp\/(\w+)/)),'|',g(/imageUrl: "(.*?)"/));
 console.log('  specs:',(g(/specs: (\[.*\]),/)||'').slice(0,300));
}
