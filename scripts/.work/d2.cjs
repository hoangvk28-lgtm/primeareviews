const fs=require('fs');const c=require('./candidates.json');
const a=Array.isArray(c)?c:Object.values(c);
const x=a[+process.argv[2]];const t=fs.readFileSync(x.file,'utf8');
console.log(x.slug,'|',x.title,'|',x.category);
const blocks=t.split('id: "').slice(1);
for(const b of blocks){
const g=(k)=>{const i=b.indexOf(k+': "');if(i<0)return '';const s=i+k.length+3;return b.slice(s,b.indexOf('"',s))};
const arr=(k,n)=>{const i=b.indexOf(k+': [');if(i<0)return '';const s=i+k.length+3;return b.slice(s,b.indexOf(']',s)).split(/\s+/).join(' ').slice(0,n)};
const i=b.indexOf('/dp/');const asin=i<0?'':b.slice(i+4,i+14);
console.log('-',b.slice(0,b.indexOf('"')),'|',g('name'),'|',asin,'|',g('imageUrl').replace('https://m.media-amazon.com/images/I/',''),'\n  specs',arr('specs',260),'\n  pros',arr('pros',180),'\n  cons',arr('cons',120));}
