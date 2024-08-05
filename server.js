const express=require("express");
const cors=require("cors");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const nodemailer=require("nodemailer");
const { resolve } = require('path');
const app=express();
app.use(express.json())
const corsOptions ={
	origin:'*', 
	credentials:true,            //access-control-allow-credentials:true
	optionSuccessStatus:200,
 }
 
 app.use(cors(corsOptions))
app.use(bodyParser.json({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));
const config={
	service:"gmail",
	host:"smtp.gmail.com",
	port:3000,
	secure:false,
	auth:{
		user:"yashpalsachs@gmail.com",
		pass:"zrhzclpcjetgquqr",
	},
}
const send=(data)=>{
	const transporter=nodemailer.createTransport(config);
	transporter.sendMail(data,(err,val)=>{
		if(err){
			console.error(err);
			return false;
		}else{
			console.log(val);
			return true;
		}
	})
}
mongoose.connect('mongodb+srv://kamaleshkumars1806:kamaleshrec@cluster0.vzpnmvu.mongodb.net/').then((e)=>{
	console.log("mongoose connected");
});
const userSchema=new mongoose.Schema({
	name:String,
	Kamalesh:Number,
	Mortien:Number,
	Sudhan:Number,
	Nitish:Number,
})
const User=new mongoose.model('User',userSchema);
const user1=new User({name:"Kamalesh",Kamalesh:0,Mortien:0,Sudhan:0,Nitish:0});
const user2=new User({name:"Mortien",Kamalesh:0,Mortien:0,Sudhan:0,Nitish:0});
const user3=new User({name:"Sudhan",Kamalesh:0,Mortien:0,Sudhan:0,Nitish:0});
const user4=new User({name:"Nitish",Kamalesh:0,Mortien:0,Sudhan:0,Nitish:0});
User.findOne({name:"Kamalesh"}).then(v=>{
	if(v==null){
		user1.save().then(val=>console.log(val));
user2.save().then(val=>console.log(val));
user3.save().then(val=>console.log(val));
user4.save().then(val=>console.log(val));
	}
}).catch(e=>{
	console.log(e);
})
app.post('/split', async (req,res)=>{
	console.log(req.body);
	const {user,Amount:amt,persons,desc}=req.body;
	const arr=[0,0,0,0]
	const prev=[0,0,0,0]
	const aft=[0,0,0,0]
	let count=persons.length;
	const num=amt/count;
	const perPerson=Math.round(num * 100) / 100;
	console.log(perPerson)
	console.log(count)
	console.log(persons.includes('Kamalesh'))
	if(persons.includes('Kamalesh')  && user!="Kamalesh"){
		arr[0]+=perPerson;
	}if(persons.includes('Mortien')&& user!="Mortien"){
		arr[1]+=perPerson;
	}if(persons.includes('Sudhan')&& user!="Sudhan"){
		arr[2]+=perPerson;
	}if(persons.includes('Nitish')&& user!="Nitish"){
		arr[3]+=perPerson;
	}
	await User.findOne({name:user}).then( async (val)=>{
		prev[0]=val.Kamalesh;
		prev[1]=val.Mortien;
		prev[2]=val.Sudhan;
		prev[3]=val.Nitish;
		const a=val.Kamalesh+arr[0];
		const b=val.Mortien+arr[1];
		const c=val.Sudhan+arr[2];
		const d=val.Nitish+arr[3];
		aft[0]=a;
		aft[1]=b;
		aft[2]=c;
		aft[3]=d;
		console.log({a,b,c,d});
		await User.findOneAndUpdate({_id:val._id},{Kamalesh:a,Mortien:b,Sudhan:c,Nitish:d});
		for(let i=0;i<persons.length;i++){
			const str=persons[i]
			if(str!=user){
			await User.findOne({name:str}).then(async(val)=>{
				if(user=="Kamalesh"){
					await User.findOneAndUpdate({name:str},{Kamalesh:(val.Kamalesh-perPerson)});
				}else if(user=="Mortien"){
					await User.findOneAndUpdate({name:str},{Mortien:(val.Mortien-perPerson)});
				}else if(user=="Sudhan"){
					await User.findOneAndUpdate({name:str},{Sudhan:(val.Sudhan-perPerson)});
				}else{
					await User.findOneAndUpdate({name:str},{Nitish:(val.Nitish-perPerson)});
				}
			})
		}
	}
})
await User.find({}).then(async(val2)=>{
	const curr=new Date();
	//console.log(val2);
	//console.log(curr.toLocaleString());
	const data={
		from:"yashpalsachs@gmail.com",
		to:"kamaleshkumartech@gmail.com",
		subject:"Latest Addtion",
		text:"SPLIT MADE  \nFROM: "+user+"\nAmount: "+amt+"\nPersons: "+persons+"\nDate: "+curr.toLocaleString(undefined, {timeZone: 'Asia/Kolkata'})+" \n"+"Description : "+desc+" \n"+"After updation Values are: "+val2+"\n",
	}
	try{await send(data)}
	catch(err){
		res.json({prev,arr,aft,sent:false})
	}
})
	res.json({prev,arr,aft,sent:true});
});
app.post('/pay',async(req,res)=>{
	const {user,name,amount}=req.body;
	const prev=[0,0,0,0]
	const next=[0,0,0,0]
	await User.findOne({name:user}).then(async (val)=>{
		console.log("from user prev value");
		console.log(val);
		prev[0]=val.Kamalesh;
		prev[1]=val.Mortien;
		prev[2]=val.Sudhan;
		prev[3]=val.Nitish;
		if(name=="Kamalesh"){
			await User.findOneAndUpdate({name:user},{Kamalesh:(val.Kamalesh+amount)});
		}else if(name=="Mortien"){
			await User.findOneAndUpdate({name:user},{Mortien:(val.Mortien+amount)});
		}else if(name=="Sudhan"){
			await User.findOneAndUpdate({name:user},{Sudhan:(val.Sudhan+amount)});
		}else{
			await User.findOneAndUpdate({name:user},{Nitish:(val.Nitish+amount)});
		}
		console.log("To user prev value");
		await User.findOne({name:name}).then(v=>{
			console.log(v);
		})
		if(user=="Kamalesh"){
			await User.findOneAndUpdate({name:name},{$inc:{Kamalesh:-amount}});
		}else if(user=="Mortien"){
			await User.findOneAndUpdate({name:name},{$inc:{Mortien:-amount}},{new:true}).then(val=>{
			})
		}else if(user=="Sudhan"){
			await User.findOneAndUpdate({name:name},{$inc:{Sudhan:-amount}});
		}else{
			await User.findOneAndUpdate({name:name},{$inc:{Nitish:-amount}});
		}
	})
	console.log("To user after value");
		await User.findOne({name:name}).then(v=>{
			console.log(v);
		})
	await User.findOne({name:user}).then(val=>{
		console.log("from user updated value: ");
		console.log(val);
		next[0]=val.Kamalesh;
		next[1]=val.Mortien;
		next[2]=val.Sudhan;
		next[3]=val.Nitish;
	})
	//console.log(prev,next);
	await User.find({}).then(async(val2)=>{
		const curr=new Date();
		const data={
			from:"yashpalsachs@gmail.com",
			to:"kamaleshkumartech@gmail.com",
			subject:"Latest Addtion",
			text:"PAY MADE  \nFROM: "+user+"\nAmount: "+amount+"\nTO: "+name+"\nDate: "+curr.toLocaleString(undefined, {timeZone: 'Asia/Kolkata'})+" \n"+"After updation Values are: "+val2+"\n",
		}
		try{await send(data)}
		catch(err){
			console.log(err);
		}
	})
	
	res.json({prev,next});
})
app.post('/viewData',async(req,res)=>{
	const user=req.body.user;
	const person=["Kamalesh","Mortien","Sudhan","Nitish"];
	const toPay=[0,0,0,0];
	await User.findOne({name:user}).then(val=>{
		toPay[0]=val.Kamalesh;
		toPay[1]=val.Mortien;
		toPay[2]=val.Sudhan;
		toPay[3]=val.Nitish;
	});
	//await toPay;
	// console.log(toPay);
	res.json({toPay});
})
app.listen(4000);