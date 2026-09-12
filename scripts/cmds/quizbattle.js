const mongoose = require("mongoose");
const QuizScore = mongoose.models.QuizScore || mongoose.model("QuizScore", new mongoose.Schema({
  threadID: String, userID: String,
  score: {type:Number,default:0}, correct: {type:Number,default:0}, wrong: {type:Number,default:0},
  streak: {type:Number,default:0}, bestStreak: {type:Number,default:0}, medals: {type:Number,default:0}, trophies: {type:Number,default:0}, cups: {type:Number,default:0}, custom: {type:Object,default:{}}
}));
const QuizMission = mongoose.models.QuizMission || mongoose.model("QuizMission", new mongoose.Schema({
  threadID: String, name: String, need: Number, type: String
}));
const POINTS=[100,69,50,25,10,55,5,1];
const rndP=()=>POINTS[Math.floor(Math.random()*POINTS.length)];
const f=t=>t.toString().replace(/[A-Za-z0-9]/g,c=>({"A":"𝐀","B":"𝐁","C":"𝐂","D":"𝐃","E":"𝐄","F":"𝐅","G":"𝐆","H":"𝐇","I":"𝐈","J":"𝐉","K":"𝐊","L":"𝐋","M":"𝐌","N":"𝐍","O":"𝐎","P":"𝐏","Q":"𝐐","R":"𝐑","S":"𝐒","T":"𝐓","U":"𝐔","V":"𝐕","W":"𝐖","X":"𝐗","Y":"𝐘","Z":"𝐙","a":"𝐚","b":"𝐛","c":"𝐜","d":"𝐝","e":"𝐞","f":"𝐟","g":"𝐠","h":"𝐡","i":"𝐢","j":"𝐣","k":"𝐤","l":"𝐥","m":"𝐦","n":"𝐧","o":"𝐨","p":"𝐩","q":"𝐪","r":"𝐫","s":"𝐬","t":"𝐭","u":"𝐮","v":"𝐯","w":"𝐰","x":"𝐱","y":"𝐲","z":"𝐳","0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"}[c]||c));
const Q100=[
{q:"BD er rajdhani ki?",a:["dhaka"]},{q:"BD er jatiyo ful ki?",a:["shapla"]},{q:"BD er jatiyo fol?",a:["kathal","jackfruit"]},{q:"BD er jatiyo mach?",a:["ilish"]},{q:"BD e jela koto?",a:["64"]},{q:"BD er mudra ki?",a:["taka"]},{q:"2+2*2=?",a:["6"]},{q:"12*12=?",a:["144"]},{q:"9*9=?",a:["81"]},{q:"7*8=?",a:["56"]},
{q:"15*15=?",a:["225"]},{q:"100/4=?",a:["25"]},{q:"1 GB = koto MB?",a:["1024"]},{q:"1 TB = koto GB?",a:["1024"]},{q:"Facebook er malik ke?",a:["mark","zuckerberg"]},{q:"Google er CEO ke?",a:["sundar"]},{q:"Sun rises in which side?",a:["east"]},{q:"Pani er formula?",a:["h2o"]},{q:"Largest planet?",a:["jupiter"]},{q:"Red planet?",a:["mars"]},
{q:"USA er rajdhani?",a:["washington"]},{q:"Japan er rajdhani?",a:["tokyo"]},{q:"UK er rajdhani?",a:["london"]},{q:"India er rajdhani?",a:["delhi"]},{q:"Eiffel Tower kothay?",a:["paris"]},{q:"Pyramid kothay?",a:["egypt"]},{q:"Cricket e koto jon?",a:["11"]},{q:"Football e koto jon?",a:["11"]},{q:"1 year = koto din?",a:["365"]},{q:"1 hour = koto sec?",a:["3600"]},
{q:"1 kg = koto gram?",a:["1000"]},{q:"Oxygen er symbol?",a:["o"]},{q:"Gold er symbol?",a:["au"]},{q:"BD er bijoy dibos kobe?",a:["16 december"]},{q:"BD er sadhinota dibos?",a:["26 march"]},{q:"Bengali new year?",a:["14 april","pohela"]},{q:"Largest ocean?",a:["pacific"]},{q:"Smallest country?",a:["vatican"]},{q:"Fastest animal?",a:["cheetah"]},{q:"Largest animal?",a:["whale"]},
{q:"Human e koto ta haddi?",a:["206"]},{q:"Human heart koto chamber?",a:["4"]},{q:"CPU er full form?",a:["central processing unit"]},{q:"RAM er full form?",a:["random access memory"]},{q:"WWW er full form?",a:["world wide web"]},{q:"HTML er full form?",a:["hypertext markup language"]},{q:"BD er longest sea beach?",a:["cox"]},{q:"Sundarban e ki thake?",a:["tiger","bagh"]},{q:"Padma Bridge er length?",a:["6.15"]},{q:"Light er speed?",a:["3 lakh","300000"]},
{q:"Binary te 10 = decimal koto?",a:["2"]},{q:"Keyboard e koto key?",a:["104","101","102"]},{q:"Mouse er abiskarok ke?",a:["douglas"]},{q:"Tesla er malik ke?",a:["elon"]},{q:"Apple er malik ke chilo?",a:["steve jobs"]},{q:"Instagram er malik?",a:["meta","facebook"]},{q:"Whatsapp er malik?",a:["meta"]},{q:"YouTube er malik?",a:["google"]},{q:"Chrome er malik?",a:["google"]},{q:"Bangladesh er code +?",a:["880"]},
{q:"India er code +?",a:["91"]},{q:"USA er code +?",a:["1"]},{q:"5 er square?",a:["25"]},{q:"6 er cube?",a:["216"]},{q:"10 er factorial?",a:["3628800"]},{q:"Prime number 2 er por?",a:["3"]},{q:"Smallest prime?",a:["2"]},{q:"0 ke ki dhora hoy?",a:["even","jor"]},{q:"Triangle e koto kon?",a:["3"]},{q:"Square e koto kon?",a:["4"]},
{q:"Rainbow te koto rong?",a:["7"]},{q:"VIBGYOR er V mane?",a:["violet"]},{q:"Sun er main gas?",a:["hydrogen"]},{q:"Earth e koto % pani?",a:["71"]},{q:"Moon e gravity koto?",a:["1/6"]},{q:"1 mile = koto km?",a:["1.6"]},{q:"1 inch = koto cm?",a:["2.54"]},{q:"Free fire er company?",a:["garena"]},{q:"PUBG er full form?",a:["playerunknown"]},{q:"Ludo koto jon khele?",a:["4"]},
{q:"Chess e koto guti?",a:["32"]},{q:"BD er kheladhula ki?",a:["kabaddi","hadudu"]},{q:"Cricket er god ke?",a:["sachin"]},{q:"Messi kon desh?",a:["argentina"]},{q:"Ronaldo kon desh?",a:["portugal"]},{q:"FIFA 2022 winner?",a:["argentina"]},{q:"IPL e koto team?",a:["10"]},{q:"BPL mane?",a:["bangladesh premier league"]},{q:"Vitamin C er ovab e ki hoy?",a:["scurvy"]},{q:"Vitamin D kothay pawa jay?",a:["sun","surjo"]},
{q:"Rokter group koto prokar?",a:["4"]},{q:"Universal donor?",a:["o"]},{q:"O+ ke dite pare?",a:["o+"]},{q:"Corona suru kobe?",a:["2019"]},{q:"WHO er full form?",a:["world health organization"]},{q:"UN er full form?",a:["united nations"]},{q:"BD UN e join kobe?",a:["1974"]},{q:"BD er first capital?",a:["mujibnagar"]},{q:"Mujibnagar kothay?",a:["meherpur"]},{q:"Language day kobe?",a:["21 february"]}
];
const ADMIN_UID="61587127840501";
module.exports={
config:{name:"quizbattle",aliases:["qb"],version:"100q-final-elite-fix",author:"Sazzad",category:"GAME"},
onStart:async({api,event,args,usersData})=>{
const {threadID,senderID}=event;
const send=t=>api.sendMessage(f(t),threadID);
if(!global.qb) global.qb={};
let cmd=args[0]?.toLowerCase()||""; let full=args.join(" ").toLowerCase();
if(cmd==="addm"){
 if(senderID!==ADMIN_UID) return send("❌ Only special admin can add mission");
 if(args.length<3) return send("Usage: #qb addm (mission name) (amount) (pts/streak)\nEx: #qb addm pro cup 25 pts");
 let last=args[args.length-1].toLowerCase(); let type="pts";
 if(["pts","point","points","streak","st"].includes(last)){ type=last.startsWith("st")?"streak":"pts"; args=args.slice(0,-1); }
 let amount=parseInt(args[args.length-1]); if(isNaN(amount)) return send("Amount number daw");
 let name=args.slice(1,-1).join(" "); if(!name) return send("Mission name daw");
 let exist=await QuizMission.findOne({threadID,name});
 if(exist){ exist.need=amount; exist.type=type; await exist.save(); } else await QuizMission.create({threadID,name,need:amount,type});
 return send(`✅ Mission Added\n🎯 ${name}\n📊 Need: ${amount} ${type}`);
}
if(cmd==="missions"||cmd==="mission"){
 let ms=await QuizMission.find({threadID}); if(!ms.length) return send("No custom mission yet\nAdmin: #qb addm pro cup 25 pts");
 let txt=`🎯 Custom Missions\n\n`; ms.forEach((m,i)=>{ txt+=`${i+1}. ${m.name} - ${m.need} ${m.type}\n`; }); return send(txt);
}
if(cmd==="task"){
 let ms=await QuizMission.find({threadID});
 let base=`🎯 QB Task\n💡 Quiz » Correct = +Pts\n🔥 Streak 6 = 🏅 Medal\n🏆 Streak 10 = 🏆 Trophy\n👑 1000 Pts = 👑 Elite Cup\n❌ Wrong = Streak Reset`;
 if(ms.length){ base+=`\n\n📌 Custom:`; ms.forEach(m=>{ base+=`\n• ${m.name}: ${m.need} ${m.type}`; }); }
 return send(base);
}
if(cmd==="top"){
 let list=await QuizScore.find({threadID}).sort({score:-1}).limit(10);
 if(!list.length) return send("No score yet");
 let msg=`🏆 Top » Leaderboard\n\n`;
 for(let i=0;i<list.length;i++){
  let u=list[i];let name=await usersData.getName(u.userID)||"User";let total=(u.correct||0)+(u.wrong||0)||1;let rate=Math.round((u.correct||0)/total*100);
  msg+=`${i+1}. ${name}\n✅ ${u.correct||0} Correct • ❌ ${u.wrong||0} Wrong • 💰 ${u.score||0} Pts\n🔥 ${u.streak||0} Streak (Best ${u.bestStreak||0}) • 📈 ${rate}% Accuracy\n🏅 ${u.medals||0} Medal • 🏆 ${u.trophies||0} Trophy • 👑 ${u.cups||0} Elite Cup\n\n`;
 } return send(msg);
}
if(cmd==="stats"||cmd==="my"){
 let u=await QuizScore.findOne({threadID,userID:senderID});if(!u)return send("You didn't play yet");
 let total=(u.correct||0)+(u.wrong||0)||1;let rate=Math.round((u.correct||0)/total*100);let name=await usersData.getName(senderID)||"User";
 return send(`📊 Stats » ${name}\n\n✅ ${u.correct||0} Correct\n❌ ${u.wrong||0} Wrong\n💰 ${u.score||0} Points\n🔥 ${u.streak||0} Streak • ⭐ ${u.bestStreak||0} Best\n🏅 ${u.medals||0} Medal • 🏆 ${u.trophies||0} Trophy • 👑 ${u.cups||0} Elite Cup\n📈 ${rate}% Accuracy\n🎯 ${1000-(u.score%1000)} Pts to next Elite Cup`);
}
if(!cmd || cmd==="next" ||!global.qb[threadID]){
 let q=Q100[Math.floor(Math.random()*Q100.length)];q.point=rndP();global.qb[threadID]=q;
 let u=await QuizScore.findOne({threadID,userID:senderID});
 let streak=u?.streak||0; let total=(u?.correct||0)+(u?.wrong||0)||1; let rate=u?Math.round((u.correct||0)/total*100):0;
 return send(`💡 Quiz » ${q.q}\n💰 ${q.point} Pts • 🔥 Streak: ${streak} • 📈 Accuracy: ${rate}%\n↳ Type #qb (ans) to answer`);
}
let q=global.qb[threadID];
let user=await QuizScore.findOne({threadID,userID:senderID});if(!user)user=new QuizScore({threadID,userID:senderID});
let ok=q.a.some(a=>full.includes(a));
if(ok){
 user.correct=Number(user.correct||0)+1;user.score=Number(user.score||0)+Number(q.point);user.streak=Number(user.streak||0)+1;
 if(user.streak>Number(user.bestStreak||0))user.bestStreak=user.streak;
 let extra="";if(user.streak%6===0){user.medals=Number(user.medals||0)+1;extra+=`\n🏅 Medal Unlocked • Total ${user.medals}`;}
 if(user.streak%10===0){user.trophies=Number(user.trophies||0)+1;extra+=`\n🏆 Trophy Unlocked • Total ${user.trophies}`;}
 let oldC=Math.floor((Number(user.score)-Number(q.point))/1000);let newC=Math.floor(Number(user.score)/1000);
 user.cups=newC; if(newC>oldC){extra+=`\n👑 Elite Cup Unlocked • ${newC} Elite Cup!`;}
 let missions=await QuizMission.find({threadID});
 for(let m of missions){
  let hit=false; if(m.type==="pts"&&user.score>=m.need) hit=true; if(m.type==="streak"&&user.streak>=m.need) hit=true;
  if(hit&&!(user.custom&&user.custom[m.name])){ if(!user.custom) user.custom={}; user.custom[m.name]=true; extra+=`\n🎯 Mission Done: ${m.name}!`; }
 }
 await user.save();delete global.qb[threadID];
 let name=await usersData.getName(senderID)||"User"; let total=(user.correct||0)+(user.wrong||0)||1;let rate=Math.round((user.correct||0)/total*100);
 return send(`✅ Correct » ${name}\n\n📝 ${q.a[0]} • +${q.point} Pts\n💰 ${user.score} Pts • 🔥 Streak: ${user.streak} • 📈 Accuracy: ${rate}%\n✅ ${user.correct} Correct • ❌ ${user.wrong||0} Wrong${extra}\n↳ Type #qb for next`);
}else{
 if(full.length>=2){
  user.wrong=Number(user.wrong||0)+1;user.streak=0;user.cups=Math.floor(Number(user.score||0)/1000);await user.save();
  let total=(user.correct||0)+(user.wrong||0)||1;let rate=Math.round((user.correct||0)/total*100);let name=await usersData.getName(senderID)||"User";
  delete global.qb[threadID];
  return send(`❌ Wrong » ${name}\n\n📝 Your Ans: ${full}\n✅ Correct: ${q.a[0]}\n💰 ${user.score||0} Pts • 🔥 Streak: 0 • 📈 Accuracy: ${rate}%\n✅ ${user.correct||0} Correct • ❌ ${user.wrong} Wrong\n↳ Type #qb for next`);
 }
}
}};