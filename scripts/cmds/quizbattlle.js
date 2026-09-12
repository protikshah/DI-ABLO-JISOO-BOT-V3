const mongoose = require("mongoose");
if(!mongoose.models.QuizScore){
mongoose.model("QuizScore", new mongoose.Schema({
threadID:String,userID:String,score:{type:Number,default:0},wins:{type:Number,default:0},correct:{type:Number,default:0},wrong:{type:Number,default:0},total:{type:Number,default:0},streak:{type:Number,default:0},bestStreak:{type:Number,default:0},medals:{type:Number,default:0},trophies:{type:Number,default:0}
}));
}
const QuizScore=mongoose.model("QuizScore");
const questions=[{q:"BD er rajdhani ki?",a:["dhaka"],point:10},{q:"2+2*2 =?",a:["6"],point:10},{q:"Facebook er malik ke?",a:["mark"],point:10},{q:"Bangladesh e koto ti jela?",a:["64"],point:10},{q:"1 GB = Koto MB?",a:["1024"],point:10}];
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function getTitle(r){if(r>=80)return"TALENTED";if(r>=60)return"PRO";if(r>=40)return"SMART";return"BEGINNER";}
module.exports={
config:{name:"quizbattle",aliases:["qb"],version:"10.5",author:"Sazzad",category:"GAME"},
onStart:async function({api,event,args,usersData}){
const{threadID,senderID}=event;
const send=(t)=>api.sendMessage(t,threadID);
if(!global.quizGame)global.quizGame={};
let g=global.quizGame[threadID];
let sub=args[0]?.toLowerCase();
let full=args.join(" ").toLowerCase().trim();
if(["top","lb"].includes(sub)){
let scores=await QuizScore.find({threadID}).sort({score:-1}).limit(10);
if(!scores.length)return send("Kono pts nai");
let txt="🏆 TOP LIST 🏆\n\n";
for(let i=0;i<scores.length;i++){let s=scores[i];let total=s.correct+s.wrong||1;let rate=Math.round((s.correct/total)*100);let name=await usersData.getName(s.userID)||"Unknown";txt+=`${i+1}. ${name} - ${getTitle(rate)}\n ✅${s.correct} ❌${s.wrong} | 💰Pts:${s.score} | 🔥${s.streak}(Best:${s.bestStreak})\n 🏅${s.medals} | 🏆${s.trophies} | ${rate}%\n\n`;}
return send(txt);
}
if(["stats","my"].includes(sub)){
let me=await QuizScore.findOne({threadID,userID:senderID});
if(!me)return send("Khelo nai");
let total=me.correct+me.wrong||1;let rate=Math.round((me.correct/total)*100);
let name=await usersData.getName(senderID);
return send(`📊 ${name} - ${getTitle(rate)}\n✅${me.correct} ❌${me.wrong}\n💰Pts:${me.score}\n🔥Streak:${me.streak} Best:${me.bestStreak}\n🏅${me.medals} 🏆${me.trophies}\nRate:${rate}%`);
}
if(full===""){
if(g)return send(`Q: ${g.q}`);
let q=shuffle([...questions])[0];global.quizGame[threadID]=q;
return send(`💡 Q: ${q.q}\nPts:${q.point} | 6=🏅 10=🏆`);
}
if(["next","skip"].includes(sub)){let q=shuffle([...questions])[0];global.quizGame[threadID]=q;return send(`Q: ${q.q} Pts:${q.point}`);}
if(!g)return send("Kono quiz nai, #qb likho");
if(full.length<2)return;
let isCorrect=g.a.some(a=>full.includes(a)||a.includes(full));
let u=await QuizScore.findOne({threadID,userID:senderID});
if(!u)u=await QuizScore.create({threadID,userID:senderID,score:0,wins:0,correct:0,wrong:0,total:0,streak:0,bestStreak:0,medals:0,trophies:0});
if(isCorrect){
u.correct+=1;u.wins+=1;u.score+=g.point;u.total+=1;u.streak+=1;
if(u.streak>u.bestStreak)u.bestStreak=u.streak;
let extra="";
if(u.streak%6===0){u.medals+=1;extra+=`\n🏅 MEDAL! Total:${u.medals}`;}
if(u.streak%10===0){u.trophies+=1;extra+=`\n🏆 TROPHY! Total:${u.trophies}`;}
await u.save();
let rate=Math.round((u.correct/(u.correct+u.wrong))*100);
let name=await usersData.getName(senderID);
delete global.quizGame[threadID];
return send(`✅ CORRECT! ${getTitle(rate)}\n${name}\nAns:${g.a[0]}\n✅${u.correct} ❌${u.wrong} | Pts:${u.score} | 🔥${u.streak}${extra}`);
}else{
u.wrong+=1;u.total+=1;u.streak=0;await u.save();
return api.setMessageReaction("❌",event.messageID,()=>{},true);
}
}
};