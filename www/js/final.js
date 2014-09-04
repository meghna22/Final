var pages = [];			//list of data-role pages
var links = [];			//list of data-role links
var screenList = [];	//history of screens
var numLinks =0;
var numPages = 0;
//var pageshow = new Event("pageshow");
var pageshow = document.createEvent("Event");
pageshow.initEvent("pageshow", true, true);
var count=0;
//var uuid=1; 
var uuid;
var db = null;
var pins, pinNumber = "";
var username = localStorage.getItem("username");
var password = localStorage.getItem("password");
var controlGroup = [];
var totalControlGroup=0;

window.addEventListener("DOMContentLoaded", init);
                    
function init(){
   document.addEventListener("deviceready", checkDB); 
     alert("ready");       	
     //checkDB();
}
function checkDB(ev){
				uuid=device.uuid;
			  	$("#loading").hide();
				pages = document.querySelectorAll('[data-role="page"]');
				numPages = pages.length;
				
				links = document.querySelectorAll('[data-role="link"]');
				numLinks = links.length;		
				
				for(var lnk=0; lnk<numLinks;lnk++ ){
				if( detectTouchSupport() ){
				links[lnk].addEventListener("touchend", handleTouchEnd); 
				}else{
				links[lnk].addEventListener("click", handleLinkClick); 
				}
				}
				 
				//document.querySelector("#reg").addEventListener("pageshow",registration);	
				document.querySelector("#save").addEventListener('click', registerPerson);
				document.querySelector("#temperature").addEventListener("pageshow",temperature);
				controlGroup = document.querySelectorAll('[data-role="chk"]');
				totalControlGroup   = controlGroup.length;	
				for( var h=0; h<totalControlGroup;h++){
			    controlGroup[h].addEventListener('click', setValues);
					
				}  
				//alert("totalControlGroup " + totalControlGroup);
				
				//document.querySelectorAll(".t").addEventListener("change", SetTemperature);
				document.querySelector("#lights").addEventListener("pageshow",lightControls);
				document.querySelector("#DoorLocks").addEventListener("pageshow",DoorLocks);
				document.querySelector("#GarageLocks").addEventListener("pageshow",GarageLocks);
				document.querySelector("#AlarmSystem").addEventListener("pageshow",AlarmControl);
				document.querySelector("#SmartAppliances").addEventListener("pageshow",SmartAppliances);
				document.querySelector("#svd").addEventListener("click",minusTemperatureValue);
				document.querySelector("#set").addEventListener("click",plusTemperatureValue);
				//alert("Page View Set");
				//app start once deviceready occurs
				console.info("deviceready");
				db = openDatabase('SmartDB', '', 'SmartDB', 1024*1024);
				if(db.version ==''){
				console.info('First time running... create tables');
				loadPage("reg"); 
				//alert("at the loadPage Reg spot");
				//means first time creation of DB
				//increment the version and create the tables
				} else {
					console.log("DB is already there");
					loadPage("home");
					
				}	
			}


function handleTouchEnd(ev){
				//pass the touchend event directly to a click event
				ev.preventDefault();
				var target = ev.currentTarget;
				var newEvt = document.createEvent('Event');
				newEvt.initEvent('tap', true, true);
				target.addEventListener('tap', handleLinkClick);
				target.dispatchEvent(newEvt);
				//this will send a click event from the touched tab to 
}

function handleLinkClick(ev){
				ev.preventDefault( );  //we want to handle clicks on the link
				var href = ev.currentTarget.href;
				var parts = href.split("#");	//could be #home or index.html#home
				loadPage( parts[1] );
				var pageID="#"+parts[1];
				console.log(pageID);
				document.querySelector(pageID).dispatchEvent(pageshow);		//send the "home" part
				}

function loadPage( pageid ){

				if( pageid == null || pageid == "undefined"){
				//show the home page
				pageid = pages[0].id;
				}
				
				if( pageid == "reg" ){
					document.querySelector("#reg").className = "active";
					document.querySelector("#home").className = "";
				}
				
				if( pageid == "home" ){
					document.querySelector("#reg").className = "";
					document.querySelector("#home").className = "active";
				}
				//if( screenList[ screenList.length - 1] != pageid){
			 	//screenList.push( pageid );  //save the history
				//}
				for(var pg=0;pg<numPages;pg++){
					if(pages[pg].id == pageid){
					//	pages[pg].className = "active";
						pages[pg].className = "active";
					//pages[pg].dispatchEvent(pageshow);	
					//animation off the page is set to take 0.4 seconds
					//setTimeout(showPage, 10, pages[pg]);	
					}else{
						pages[pg].className = "";
					//now add the class active to animate.
					//setTimeout(hidePage, 0, pages[pg]);	
					}
				}
}

function hidePage(pg){
	pg.className = "hide";
	//this class replaces show
}

function showPage(pg){
	pg.classList.add("active");	
}
		
function detectTouchSupport( ){
				msGesture = navigator && navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0 && MSGesture;
				touchSupport = (("ontouchstart" in window) || msGesture || (window.DocumentTouch && document instanceof DocumentTouch));
				return touchSupport;
}
	
function registerPerson(){
			$("#loading").show();
			var personName= document.querySelector("#inpt").value;
			var pinNumber= document.querySelector("#inpt1").value;

			var savePersonName = localStorage.setItem("username", personName);
			var savePersonPIN = localStorage.setItem("password", pinNumber);
			
			if(personName!=="" && pinNumber!==""){
			console.log(personName);
			//$("#loading").show();
			$.ajax({
			url: "http://faculty.edumedia.ca/griffis/mad9022/final-server/register-home.php?",
			type:"post",
			dataType: "jsonp",
			data: "uuid=" + uuid + "&username=" + personName + "&pin=" + pinNumber,
			jsonpCallback: "registrationDone"
			}).fail( badCall );
			} else {
			alert("you must enter a username and pin.");
			}
			}

function registrationDone(data){
			$("#loading").hide();
			//setTimeout($("#loading").attr("class","hide"),3000);
			if( data.code == 0 ){
			$.ajax({
			url: "http://faculty.edumedia.ca/griffis/mad9022/final-server/get-settings.php?",
			type:"post",
			dataType: "jsonp",
			data: "uuid=" + uuid + "&username=" + username,
			jsonpCallback: "saveSettings"
			}).fail( badCall );
			
			db.changeVersion('', '1.0');
			
			loadPage("home");
			} else{
			alert("Failed");
		} 		
	}

function saveSettings(data){
					//console.log(data);
					if ( parseInt(data.code)==0){
					for(var i=0; i<totalControlGroup; i++){
					controlGroup[i].value = data.settings[i].default_value;
					//console.log(value);
					if( data.settings[i].default_value == 1 ){
					controlGroup[i].checked = true;
					} else{
					controlGroup[i].checked = false;
			     }
			   }
			}
					else{
					alert("Sorry nothing to display");
			    }
	}

function temperature(){
			getZone(1);
}
			
function getZone(zone){
	    $("#loading").show();
		$.ajax({
			  url: "http://faculty.edumedia.ca/griffis/mad9022/final-server/get-zone.php?",
			  type:"post",
			  dataType: "jsonp",
			  data: "uuid=" + uuid + "&username=" + username + "&zone=" + zone,
			  jsonpCallback: "showZoneValues"
			  }).fail( badCall );
}

function showZoneValues(data){
			//loadPage("temperature");
			$("#loading").hide();
			console.log(data);
			if(parseInt(data.code)==0){
			var zone = data.zone;
			var sets = [];
			
			switch(zone){
				case 1:
				sets = document.querySelectorAll(".t");
				break;
				
				case 2:
				sets = document.querySelectorAll(".l");
				break;
				case 3:
				sets = document.querySelectorAll(".Gl");
				break;
				case 4:
				sets = document.querySelectorAll(".dl");
				break;
				case 5:
				sets = document.querySelectorAll(".AS");
				break;
				case 6:
				sets = document.querySelectorAll(".SA");
				break;
				default:
				alert("No match found");
			}
			//var temp = document.querySelectorAll(".t");
			/*for(var i=0; i<data.values.length; i++){
			var value = data.values[i].current_value;
			var target = document.getElementById(data.values[i].setting_title);
			console.log(target);
			if(value==1){
				target.checked = true;
				}else if(value==0){
				target.checked = false;
				}else{
				target.value = value;
			}*/
			for(var i=0; i<data.values.length; i++){
			sets[i].value= data.values[i].current_value;
			//console.log(value);
			if( data.values[i].current_value == 1){
			 sets[i].checked = true;
			} else{
			sets[i].checked = false;
		   }
		}
	}
			else{
			alert("Sorry nothing to display");
		}
		/*	}   */ 
}
function minusTemperatureValue(ev){
		ev.preventDefault();
		var temp = document.querySelector("#prop-20");
		var tempValue = document.querySelector("#prop-20").value;
		tempValue -= 1;
		temp.stepDown(1);
	
}
function plusTemperatureValue(ev){
	ev.preventDefault();
	var temp = document.querySelector("#prop-20");
	var tempValue = temp.value;
	tempValue += 1;
	temp.stepUp(1);
}

function setValues(ev){
	$("#loading").show();
	//ev.preventDefault();
	var groupId = ev.currentTarget.id;
	var prop=groupId.split("prop-");
	//var value = ev.currentTarget.value;
	//alert("prop"+prop[1]);
	//alert("val"+value);
	//alert("username"+username);
	var newVal = ev.currentTarget.checked;
	var value = 0;
	if( newVal ){
		value = 1;
		console.log(value);
	}
	if(groupId!="prop-20"){
    
	}
	else{
		value=document.querySelector("#prop-20").value;
	}
	
	$.ajax({
			url: "http://faculty.edumedia.ca/griffis/mad9022/final-server/set-value.php?",
			type:"post",
			dataType: "jsonp",
			data: "uuid=" + uuid + "&username=" + username + "&prop="+ prop[1]+"&val="+value,
			jsonpCallback: "propertyValueSet"
			}).fail( badCall );	
}

function propertyValueSet(data){
	
	$("#loading").hide();
	console.log(data);
}
function lightControls(){
	       $("#loading").show();
			$.ajax({
			url: "http://faculty.edumedia.ca/griffis/mad9022/final-server/get-zone.php?",
			type:"post",
			dataType: "jsonp",
			data: "uuid=" + uuid + "&username=" + username + "&zone=2",
			jsonpCallback: "showZoneValues"
			}).fail( badCall );
}
function DoorLocks(){
			$("#loading").show();
			$.ajax({
			url: "http://faculty.edumedia.ca/griffis/mad9022/final-server/get-zone.php?",
			type:"post",
			dataType: "jsonp",
			data: "uuid=" + uuid + "&username=" + username + "&zone=4",
			jsonpCallback: "showZoneValues"
			}).fail( badCall );
}
function GarageLocks(){
	       $("#loading").show();
	       $.ajax({
			url: "http://faculty.edumedia.ca/griffis/mad9022/final-server/get-zone.php?",
			type:"post",
			dataType: "jsonp",
			data: "uuid=" + uuid + "&username=" + username + "&zone=3",
			jsonpCallback: "showZoneValues"
			}).fail( badCall );

}

function AlarmControl(){
			 $("#loading").show();
		    $.ajax({
			url: "http://faculty.edumedia.ca/griffis/mad9022/final-server/get-zone.php?",
			type:"post",
			dataType: "jsonp",
			data: "uuid=" + uuid + "&username=" + username + "&zone=5",
			jsonpCallback: "showZoneValues"
			}).fail( badCall );
			
			/*pins = document.querySelectorAll("li.pin");
			for(var p=0; p<pins.length; p++){
			pins[p].addEventListener("click", addToPinNumber);   
			}*/
}
function SmartAppliances(){
	 $("#loading").show();
	 $.ajax({
			url: "http://faculty.edumedia.ca/griffis/mad9022/final-server/get-zone.php?",
			type:"post",
			dataType: "jsonp",
			data: "uuid=" + uuid + "&username=" + username + "&zone=6",
			jsonpCallback: "showZoneValues"
			}).fail( badCall );
			
}
function badCall(err){
			console.log("ajax failed");
			console.log(err);
}
/*function addToPinNumber(ev){
			var pin = ev.currentTarget;
			var display = document.querySelector(".display");
			var digit = pin.getAttribute("data-num");
			console.log( digit);
			if( digit == "#" || digit == "*"){
			//clear out the pinNumber
			pinNumber = "";
			//clear the display
			display.innerHTML = "";
			}else{
			if( pinNumber.length < 4){
			pinNumber += digit  
			//display pin
			var s = document.createElement("span");
			s.innerHTML = "*";
			display.appendChild(s);
			
            }
           }
}*/


	