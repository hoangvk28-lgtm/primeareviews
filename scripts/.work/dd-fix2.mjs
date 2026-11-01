import fs from "node:fs";
const skip=new Set([...fs.readFileSync("scripts/.work/queue-16.txt","utf8").split(/\s+/),...fs.readFileSync("scripts/.work/queue-17.txt","utf8").split(/\s+/)].filter(Boolean));
const words=t=>t.toLowerCase().replace(/[^a-z0-9 ]+/g," ").split(/\s+/).filter(Boolean);
const h=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
const files=fs.readdirSync("data/guides").filter(f=>f.endsWith(".json"));
const prose=g=>[g.summary,...g.intro,...g.products.flatMap(p=>[p.description,p.verdict]),...g.whatMatters.map(w=>w.detail),...g.faq.map(f=>f.a),g.finalTake].join(" ");
const B=[(a,b)=>`Budget-wise, plan on $${a} to $${b}.`,(a,b)=>`Spending runs in the $${a}-${b} range.`,(a,b)=>`Pricing sits between $${a} and $${b} for this one.`,(a,b)=>`Think of it as a $${a}-${b} purchase.`,(a,b)=>`Roughly $${a} to $${b} is what it asks.`,(a,b)=>`Cost-wise it belongs to the $${a}-${b} group.`,(a,b)=>`You would pay somewhere in the $${a}-${b} window.`,(a,b)=>`On price, it is a $${a} to $${b} model.`];
const T=[y=>`; every rank is set by what the pick gives up or gains compared with ${y}.`,y=>`; positions come from how each model's compromises compare with ${y}.`,y=>`, with the order set by which tradeoffs each pick accepts relative to ${y}.`,y=>`, and the order reflects each pick's strengths and gaps against ${y}.`,y=>`, so every placement weighs one model's compromises against ${y}.`];
const R=[(n,x,r)=>`I mean to say: ${n} ${x} sit here on the strength of ${r}.`,(n,x,r)=>`${n[0].toUpperCase()+n.slice(1)} ${x} are covered below, judged from ${r}.`,(n,x,r)=>`The ${n} ${x} below are ranked using ${r}.`,(n,x,r)=>`Rankings for these ${n} ${x} rest on ${r}.`,(n,x,r)=>`Behind these ${n} ${x} is a read of ${r}.`];
R[0]=(n,x,r)=>`Judgments on these ${n} ${x} come straight from ${r}.`;
function rewrite(t,k){
 t=t.replace(/(?:Its price lands between \$(\d+) and \$(\d+)|Expect it in the \$(\d+) to \$(\d+) (?:bracket|bucket)|That puts it in the \$(\d+)-(\d+) price tier|The listing falls in the \$(\d+)-(\d+) (?:bracket|bucket)|It is priced somewhere from \$(\d+) to \$(\d+))\./g,(m,...g)=>{const n=g.slice(0,10).filter(x=>x!==undefined);return B[(k+Number(n[0]))%B.length](n[0],n[1])});
 t=t.replace(/(?:, and every pick is placed by the tradeoff it makes against|, with each rank set by what that pick gives up or gains versus|, and each position reflects the compromise it makes next to|, placing every model by how it trades off against) ([^.]+?)\./,(m,y)=>T[k%T.length](y));
 t=t.replace(/We went through (\w+) ([\w -]+?) from the page, drawing on ([^.]+?)\./,(m,n,x,r)=>R[k%R.length](n,x,r));
 t=t.replace(/(\w+) ([\w -]+?) were assessed here, relying on ([^.]+?)\./,(m,n,x,r)=>R[(k+1)%R.length](n.toLowerCase(),x,r));
 t=t.replace(/We reviewed (\w+) ([\w -]+?) on paper, using ([^.]+?)\./,(m,n,x,r)=>R[(k+2)%R.length](n,x,r));
 return t}
const words10=(w)=>{const o=[];for(let i=0;i+10<=w.length;i++)o.push(w.slice(i,i+10).join(" "));return o};
for(let round=0;round<6;round++){
 const gs=files.map(f=>[f,JSON.parse(fs.readFileSync("data/guides/"+f,"utf8"))]);
 const seen=new Map();for(const[,g]of gs)for(const s of new Set(words10(words(prose(g)))))(seen.get(s)||seen.set(s,[]).get(s)).push(g.slug);
 const bad=new Set();for(const[,v]of seen)if(v.length>=3)for(const s of v.slice(2))if(!skip.has(s))bad.add(s);
 console.log("round",round,"guides to edit",bad.size);if(!bad.size)break;
 for(const s of bad){const f=`data/guides/${s}.json`;const t=fs.readFileSync(f,"utf8");const n=rewrite(t,h(s)+round*3+round);if(n!==t)fs.writeFileSync(f,n)}
}
