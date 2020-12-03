const socket = io('http://localhost:8000');

// Get DOM elements in respective Js variables
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp')
const messageContainer = document.querySelector(".container")

// Audio that will play on receiving messages
var audio = new Audio('ting.mp3');

// Function which will append event info to the contaner
const append = (message, position)=>{
    const messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    if(position =='left'){ 
        audio.play();
    }
}


// Ask new user for his/her name and let the server know
const name = prompt("Enter your name to join");
socket.emit('new-user-joined', name);

// If a new user joins, receive his/her name from the server
socket.on('user-joined', name =>{
    append(`${name} joined the chat`, 'right')
})

// If server sends a message, receive it
socket.on('receive', data =>{
    let message=cbc_decryption(data.message);
    append(`${data.name}: ${message}`, 'left')
})

// If a user leaves the chat, append the info to the container
socket.on('left', name =>{
    append(`${name} left the chat`, 'right')
})

function asciiDif(a,b) {
    return a.charCodeAt(0) - b.charCodeAt(0);
}

function encrypt(s,key)
{ 
    let i=0,j; 
    let crypt="";

	    for(j=0;j<4;j++)
	    {
	    	let x=asciiDif(key[j],'A')+ asciiDif(s[j],'A');
	    	if(x>57)
	    	x=(x-57);
	    	crypt=crypt+String.fromCharCode(x+65);
		}
        
	return crypt;
}
function encode(s,key,iv)
{
	let  i=0,j;
	let ans="";
	while(i<s.length)
	{
        let  temp=s.substr(i,4);
        let  str="";
	    for(j=0;j<4;j++,i++)
	    {
           
            let  t= asciiDif(temp[j],'A')^asciiDif(iv[j],'A');
           
            let x = String.fromCharCode(t+65)
            //let x='A'+t;
            
	       	str=str+x;
        }
       
		 iv=encrypt(str,key);
	   	 ans=ans+iv;
    }
   
	return ans;
}
function decrypt(s,key)
{
	   let j,i=0;
	 	let crypt="";
	    for(j=0;j<4;j++)
	    {
	    	let x=asciiDif(s[j],'A')-asciiDif(key[j],'A');
	    	if(x<0)
	    	x=(x+57);
	    	
            crypt=crypt+String.fromCharCode(x+65);
            
		} 
		return crypt;
}
function decode(s,key,iv)
{ 
    let i=0,j;
	let ans="";
	while(i<s.length)
	{
		let c=s.substr(i,4);
		let temp=decrypt(c,key);
		let str="";
	    for(j=0;j<4;j++,i++)
	    {
	    	let t=asciiDif(temp[j],'A')^asciiDif(iv[j],'A');
	    	let  x=String.fromCharCode(t+65);
	       	str=str+x;
		}
		 iv=c;
	   	 ans=ans+str;
	}
	return ans;
}
function cbc_encryption(message) 
{ 
   let s=message;
   let key ="hwba";
   let iv="lfei";
   console.log("Plain Text "+s);
   
   let n=s.length;
   let k=key.length;
   while(n%k!=0)
   {
   	s=s+"_";
   	n++;
   }
   s=s.replace(" ", "_");
   console.log("iv Text "+iv);
   console.log("key is "+key);
   let ct=encode(s,key,iv);
//    console.log(" Encoded Text "+ct);
//    //string st=decode(s);
//      let d=decode(ct,key,iv);
//     s=d.replace("_", " ");;
//     console.log("after replace "+s);
   return ct;
}
function cbc_decryption(message) 
{ 
   let s=message;
   let key ="hwba";
   let iv="lfei";
   console.log("cipher Text "+s);
   console.log("iv Text "+iv);
   console.log("key is "+key);
  
     let d=decode(s,key,iv);
    s=d.replace("_", " ");;
    console.log("decrypted text is "+s);
   return s;
}

// If the form gets submitted, send server the message
form.addEventListener('submit', (e) => {
    e.preventDefault();
    let message = messageInput.value;
    append(`You: ${message}`, 'right');
    //encrypt msg using key cbc
    message=cbc_encryption(message);
    console.log("encrypted text is"+message);
    socket.emit('send', message);
    messageInput.value = ''
})