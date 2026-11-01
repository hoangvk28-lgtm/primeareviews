const fs=require("fs");const f=process.argv[2];let s=fs.readFileSync(f,"utf8");const B=String.fromCharCode(92);
const re=new RegExp(" in the (\$\d+ to \$\d+|under \$\d+) (range|tier|bracket)\."+B+B+"n"+B+B+"nIt ranks","g");
s=s.replace(re,(m,a)=>" and sells at "+a+"."+B+"n"+B+"nThis one ranks");
fs.writeFileSync(f,s);
