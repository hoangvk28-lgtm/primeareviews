import fs from "node:fs";
// d: {slug,category,n,h1prod,metaTitle,metaDescription,mainKeyword,summary,intro,picks:[{i,id,award,score,verdict,description,specs:[[l,v]x4],pros,cons,idealFor,skipIf}],methodology,whatMatters,howToChoose,faq,finalTake}
export function build(d){
  const F=JSON.parse(fs.readFileSync(`scripts/.work/facts/${d.slug}.json`));
  const products=d.picks.map((q,k)=>{const p=F.products[q.i];return{id:q.id,rank:k+1,award:q.award,name:p.name,score:q.score,imageUrl:p.imageUrl,amazonUrl:`https://www.amazon.com/dp/${p.asin}?tag=primeareviews-20`,verdict:q.verdict,description:q.description,keySpecs:q.specs.map(([label,value])=>({label,value})),pros:q.pros,cons:q.cons,idealFor:q.idealFor,skipIf:q.skipIf}});
  const g={slug:d.slug,category:d.category,h1:`The ${products.length} Best ${d.h1prod} of 2026, Ranked & Reviewed`,metaTitle:d.metaTitle,metaDescription:d.metaDescription,mainKeyword:d.mainKeyword,publishedAt:"2026-11-01",updatedAt:"2026-11-01",readTime:"10 min",heroImage:F.heroImage,summary:d.summary,intro:d.intro,products,methodology:d.methodology,whatMatters:d.whatMatters,howToChoose:d.howToChoose,faq:d.faq,finalTake:d.finalTake,related:[]};
  fs.writeFileSync(`data/guides/${d.slug}.json`,JSON.stringify(g,null,1));
}
