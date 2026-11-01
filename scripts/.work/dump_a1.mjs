import fs from "fs";
const c=JSON.parse(fs.readFileSync("scripts/.work/candidates.json","utf8")).slice(1,16);
const [a,b]=process.argv.slice(2).map(Number);
for(const x of c.slice(a,b)){
 const t=fs.readFileSync(x.file,"utf8");
 console.log("\n##### "+x.slug+" | "+x.title);
 const i=t.indexOf("export const products");
 const body=t.slice(i);
 const re=/id:\s*"([^"]+)",\s*rank:\s*(\d+)[\s\S]*?name:\s*"([^"]+)"[\s\S]*?imageUrl:\s*"([^"]+)"[\s\S]*?\/dp\/(\w+)[\s\S]*?specs:\s*(\[[^\]]*\])/g;
 let m;while((m=re.exec(body))){
  const seg=body.slice(m.index,m.index+4000);
  const price=(seg.match(/price:\s*"([^"]+)"/)||[])[1];
  const d=(seg.match(/description:\s*\n?\s*"([^"]{0,330})/)||[])[1];
  console.log(`${m[2]}. ${m[1]} | ${m[3]} | ${m[5]} | ${m[4]} | ${price} | ${m[6]}\n   D: ${d}`);
 }
}
