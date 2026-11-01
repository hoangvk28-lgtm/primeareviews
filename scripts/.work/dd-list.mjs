import fs from "node:fs";import path from "node:path";
const dir="data/guides";const cands=new Map(JSON.parse(fs.readFileSync("scripts/.work/candidates.json","utf8")).map(c=>[c.slug,c]));
const skip=new Set([...fs.readFileSync("scripts/.work/queue-16.txt","utf8").split(/\s+/),...fs.readFileSync("scripts/.work/queue-17.txt","utf8").split(/\s+/)].filter(Boolean));
const words=t=>t.toLowerCase().replace(/[^a-z0-9 ]+/g," ").split(/\s+/).filter(Boolean);
const sh=(t,n=10)=>{const w=words(t);const o=new Set();for(let i=0;i+n<=w.length;i++)o.add(w.slice(i,i+n).join(" "));return o};
const gs=fs.readdirSync(dir).filter(f=>f.endsWith(".json")).map(f=>JSON.parse(fs.readFileSync(path.join(dir,f),"utf8")));
const fields=g=>[["summary",g.summary],...g.intro.map((x,i)=>["intro"+i,x]),...g.products.flatMap((p,i)=>[["p"+i+".desc",p.description],["p"+i+".verdict",p.verdict]]),...g.whatMatters.map((w,i)=>["wm"+i,w.detail]),...g.faq.map((f,i)=>["faq"+i,f.a]),["final",g.finalTake]];
const seen=new Map();for(const g of gs)for(const s of sh(fields(g).map(x=>x[1]).join(" ")))seen.set(s,(seen.get(s)||new Set()).add(g.slug));
const rep=[...seen].filter(([,v])=>v.size>=3);
const out=[];
for(const g of gs){if(skip.has(g.slug))continue;
 const c=cands.get(g.slug);let ph=[];
 if(c&&fs.existsSync(c.file)){const src=sh(fs.readFileSync(c.file,"utf8"));ph=[...sh(fields(g).map(x=>x[1]).join(" "))].filter(s=>src.has(s))}
 const rp=rep.filter(([,v])=>v.has(g.slug)).map(([k])=>k);
 const all=[...new Set([...ph,...rp])];if(!all.length)continue;
 out.push("### "+g.slug+" "+(ph.length?"SRC ":"")+(rp.length?"REP":""));
 for(const [n,t] of fields(g)){const tw=words(t).join(" ");
  for(const sn of t.split(/\n+|(?<=[.!?])\s+/)){const sw=words(sn).join(" ");let m=false;
   for(const p of all){if(!tw.includes(p))continue;const pw=p.split(" ");for(let i=0;i+5<=pw.length;i++)if(sw.includes(pw.slice(i,i+5).join(" ")))m=true}
   if(m)out.push("["+n+"] "+sn)}}
}
console.log(out.join("\n"));
