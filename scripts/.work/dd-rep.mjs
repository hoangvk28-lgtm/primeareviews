import fs from "node:fs";
const words=t=>t.toLowerCase().replace(/[^a-z0-9 ]+/g," ").split(/\s+/).filter(Boolean);
const gs=fs.readdirSync("data/guides").filter(f=>f.endsWith(".json")).map(f=>JSON.parse(fs.readFileSync("data/guides/"+f,"utf8")));
const prose=g=>[g.summary,...g.intro,...g.products.flatMap(p=>[p.description,p.verdict]),...g.whatMatters.map(w=>w.detail),...g.faq.map(f=>f.a),g.finalTake].join(" ");
const seen=new Map();for(const g of gs){const w=words(prose(g));for(let i=0;i+10<=w.length;i++){const s=w.slice(i,i+10).join(" ");(seen.get(s)||seen.set(s,new Set()).get(s)).add(g.slug)}}
for(const[k,v]of seen)if(v.size>=3)console.log(k,"|",[...v].join(","));
