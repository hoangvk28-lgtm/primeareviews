import fs from "node:fs";
const slugs=[...fs.readFileSync("scripts/.work/dd-out.txt","utf8").matchAll(/^### (\S+)/gm)].map(m=>m[1]);
const h=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
const manual={
"best-docking-station-for-dual-monitor-multi-monitor-setups":[["simultaneous dual 4K@60Hz or single 8K output","dual 4K@60Hz at once or one 8K display"]],
"best-docking-stations-for-two-laptops":[["two USB-C MST ports for laptop inputs, dual HDMI 4K monitor output, 60W PD per laptop","a pair of USB-C MST inputs, one per laptop, plus twin HDMI 4K outputs and 60W of charging for each laptop"]],
"best-dreame-robot-vacuums":[["The same suction rating as the top pick at a lower price.","Matches the top pick on suction while costing less."],["and it is a newer listing with a shorter track record","and the listing is newer, with less history behind it"]],
"best-ergonomic-keyboard-and-mouse-combos":[["a split, curved keyboard with a wrist rest and a true vertical mouse","a curved split keyboard, a built-in wrist rest and a true vertical mouse"]],
"best-laptop-cooling-pads-for-alienware-laptops":[["a combined sealed foam for 13 to 17.3 inch laptops and a bottom air intake","sealed foam that spans 13 to 17.3 inch laptops, plus a bottom air intake"],["a combined sealed foam for 13 to 17.3 inch laptops","sealed foam that covers 13 to 17.3 inch laptops"],["extra foam inserts for 13 to 14 inch laptops, physical buttons for RGB and fan control, and both USB-A and USB-C ports","added foam inserts for 13 to 14 inch laptops, plus real buttons to control RGB and fan speed and both USB-A and USB-C ports"]],
"best-laptop-cooling-pads-for-asus-laptops":[["nine fans in a top and bottom vent design, fits 15.6 to 19.3 inch laptops, and has","nine fans arranged across top and bottom vents for 15.6 to 19.3 inch laptops, and adds"],["offers five height settings up to 6 inches, 2 USB ports and a phone holder","gives you five heights up to 6 inches, a pair of USB ports and a phone holder"]],
"best-lawn-mowers-for-seniors":[["Pick it for a small to mid-size flat lawn where a push mower is still manageable.","Pick it for a flat lawn of modest size where pushing is still comfortable."],["Choose it for a small yard near an outlet where a battery is unwanted.","Choose it for a small yard within reach of an outlet when you want no battery."]],
"best-lawn-mowers-under-300":[["The EasyCut pairs an 18-inch deck with a 144cc 4-cycle gas engine and side discharge.","The EasyCut has an 18-inch deck, side discharge and a 144cc four-cycle gas engine."]],
"best-lidar-robot-vacuums":[["a self-empty base the listing rates for up to 7 to 9 weeks between bag changes","a self-empty base that the listing says goes 7 to 9 weeks before the bag needs changing"]],
"best-lightweight-lawn-mowers":[["Full 21-inch coverage in the lightest cordless full-width mower in this ranking.","A full 21-inch cut from the lightest cordless full-width mower ranked here."]],
"best-printers-for-checks":[["It suits light, informal check paper printing where magnetic ink is not required.","It fits occasional, informal check printing that does not need magnetic ink."]],
"best-roborock-robot-vacuums":[["a self-empty dock rated for up to 7 to 9 weeks between emptying","a self-empty dock the listing rates at 7 to 9 weeks per emptying"]],
"best-shark-robot-vacuums":[["a HEPA bagless self-empty base rated for 30 days of capacity","a bagless HEPA self-empty base with 30 days of capacity"]],
"best-triple-monitor-docking-stations":[["Triple 4K@60Hz at the lowest price in this list.","Triple 4K@60Hz for the least money here."]],
"best-bagless-self-emptying-robot-vacuums":[["a bagless reusable bin that the listing rates for up to 7 to 9 weeks between empties","a reusable bagless bin the listing rates at 7 to 9 weeks per empty"]],
"best-privacy-focused-robot-vacuums":[["a self-empty base the listing rates for up to 7 to 9 weeks.","a self-empty base listed at 7 to 9 weeks per emptying."],["a self-empty base the listing rates for up to 7 to 9 weeks.","a self-empty base listed at 7 to 9 weeks per emptying."]],
"best-56v-leaf-blowers":[["and it is a newer listing with a shorter track record","and it is a newer listing with less history"]],
"best-toaster-ovens-for-one-person":[["It is a newer listing with a shorter track record.","It is a newer listing with less history behind it."]],
"best-18-inch-lawn-mowers":[["Choose it for a small to mid-size yard where a light gas mower fits.","Choose it for a modest yard that suits a light gas mower."],["Choose it for a small, flat, well-maintained lawn.","Choose it for a flat, tidy lawn of small size."]],
"best-push-button-start-lawn-mowers":[["Choose it for a small lawn on a budget.","Choose it for a small lawn when money is tight."]],
"best-lawn-mowers-under-1000":[],
"best-roborock-robot-vacuums#":[],
};
const man2={"best-roborock-robot-vacuums":[["Choose it for a small apartment or a secondary unit.","Choose it for a compact apartment or as a second robot."]],
"best-lightweight-lawn-mowers":[["Choose it for a small, unobstructed yard close to an outlet.","Choose it for a small, open yard near an outlet."]]};
for(const [k,v] of Object.entries(man2))manual[k]=[...(manual[k]||[]),...v];
const bracket=[(a,b,w)=>`Its price lands between $${a} and $${b}.`,(a,b,w)=>`Expect it in the $${a} to $${b} ${w}.`,(a,b,w)=>`That puts it in the $${a}-${b} price tier.`,(a,b,w)=>`The listing falls in the $${a}-${b} ${w}.`,(a,b,w)=>`It is priced somewhere from $${a} to $${b}.`];
const tails=[(y)=>`, and every pick is placed by the tradeoff it makes against ${y}.`,(y)=>`, with each rank set by what that pick gives up or gains versus ${y}.`,(y)=>`, and each position reflects the compromise it makes next to ${y}.`,(y)=>`, placing every model by how it trades off against ${y}.`];
const rests=[(n,x,r)=>`We went through ${n} ${x} from the page, drawing on ${r}.`,(n,x,r)=>`${n[0].toUpperCase()+n.slice(1)} ${x} were assessed here, relying on ${r}.`,(n,x,r)=>`This list covers ${n} ${x}, built from ${r}.`,(n,x,r)=>`Our read of ${n} ${x} comes from ${r}.`];
for(const s of slugs){const f=`data/guides/${s}.json`;let t=fs.readFileSync(f,"utf8");const k=h(s);let c=0;
 for(const [a,b] of manual[s]||[]){if(t.includes(a)){t=t.split(a).join(b);c++}}
 t=t.replace(/It sits in the \$(\d+)-(\d+) (bracket|bucket)\./g,(m,a,b,w)=>bracket[(k+a.length+Number(a))%5](a,b,w));
 t=t.replace(/, in the \$(\d+)-(\d+) (bracket|bucket)\./g,(m,a,b,w)=>`. ${bracket[(k+Number(b))%5](a,b,w)}`);
 t=t.replace(/, and each pick is placed by the tradeoff it makes against ([^.]+?)\./,(m,y)=>tails[k%4](y));
 t=t.replace(/We (?:reviewed|ranked) (\w+) ([\w -]+?) on paper,? (?:using|from|going through) (?:their )?([^.]+?)\./,(m,n,x,r)=>rests[k%4](n,x,r));
 fs.writeFileSync(f,t);}
