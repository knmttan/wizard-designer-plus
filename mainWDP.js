
let currentPage = location.href;
// auto-refresh page if its in the node editor or transition editor (changes only get applied after a refresh)
setInterval(function()
{
	if (currentPage != location.href)
	{
		// page has changed, set new page as 'current'
		currentPage = location.href;
		if(currentPage.includes('node')||currentPage.includes('transition')) {
			location.reload();
		}
	}
}, 500);


// Fast save code below
const path = decodeURI(document.location.pathname);
// First check if we are on the node editor page, for performance reasons because we set a mutation observer
if(currentPage.includes('node')) {
	try {
		//skip confirmation pop up except transition
		const realConfirm=window.confirm;
		
		if (path.split('/')[1] != 'transition'){
			window.confirm=function(){
				return true;
			};
		} else {
			window.confirm=realConfirm;
		}
		//skip save description
		let saveDescNode = null;
		let display = '';
		const observer = new MutationObserver(function(mutations_list) {
			mutations_list.forEach(function(mutation) {
				mutation.addedNodes.forEach(function(added_node) {
					if(added_node.role == 'presentation') {
						if(added_node.innerText.indexOf('Update element description') !== -1) {
							saveDescNode = added_node;
							saveDescNode.style.display = display;
						}
					}
				});
			});
		});
		observer.observe(document.body, { subtree: false, childList: true });
		
		// Add save description button
		
		const lis = document.getElementsByClassName("App")[0].getElementsByTagName('li');
		let saveButtonLi = null;
		for (var i = 0; lis[i]; i++) {
			if(lis[i].innerText=="Save changes") {
				saveButtonLi = lis[i];
			}
		}
		const parentUl = saveButtonLi.parentNode;
		let newSaveDescriptionLi = document.createElement("li");
		newSaveDescriptionLi.innerHTML = saveButtonLi.innerHTML;
		const txt = newSaveDescriptionLi.getElementsByTagName('span')[0];
		txt.textContent = "Save description";
		parentUl.appendChild(newSaveDescriptionLi);
		parentUl.appendChild(saveButtonLi);
		
		
			const saveChangesButton = saveButtonLi.getElementsByTagName('button')[0];
			const saveDescriptionButton = newSaveDescriptionLi.getElementsByTagName('button')[0];
		
			let saveDescriptionClicked = false;
			saveDescriptionButton.addEventListener("click", function() {
				saveDescriptionClicked = true;
				saveChangesButton.click()
				saveDescriptionClicked = false;
			});
		
			saveChangesButton.addEventListener("click", function() {
				if(saveDescNode) {
					if(saveDescriptionClicked) {
						display = '';
						saveDescNode.style.display = '';
					} else {
						display = 'none';
						saveDescNode.style.display = 'none';
					}
				} else {
					if(saveDescriptionClicked) {
						display = '';
					} else {
						display = 'none';
					}
				}
			});
	} catch(e) {
		console.log("ERROR")
	}
}


//change title to flow name
if (['node', 'transition'].includes(path.split('/')[1])) {
    let flowName = path.split('/')[2].replace('Cancellation ', '');
    while(flowName.length>30) {
	    flowName = flowName.split(' ').slice(1).join(' ');
    }
    document.title = flowName
}
function setFavicons(favImg) {
	let headTitle = document.querySelector('head');
	let setFavicon = document.createElement('link');
	setFavicon.setAttribute('rel', 'shortcut icon');
	setFavicon.setAttribute('href', favImg);
	headTitle.appendChild(setFavicon);
}

function removeElementsByClass(className) {
	const elements = document.getElementsByClassName(className);
	while (elements.length > 0) {
		elements[0].parentNode.removeChild(elements[0]);
	}
}



// change icon
if (document.location.host.match(".*wizard-designer.agoda.local.*")) {
	if (document.location.pathname.split('/')[1] == 'integrationPoint') {
		setFavicons('https://cdn-icons-png.flaticon.com/128/9110/9110100.png')
		document.title = 'API builder';
	} else if (document.location.pathname.split('/')[1].includes('deploy')) {
		setFavicons('https://cdn-icons-png.flaticon.com/128/4471/4471714.png')
		document.title = 'Deploy';
	} else {
		setFavicons('https://cdn-icons-png.flaticon.com/128/1680/1680365.png');
	}
} else if (window.location.href.match(".*agoda.*\/wizard.*")) {
	setFavicons('https://cdn-icons-png.flaticon.com/128/1541/1541402.png');
	// for agent debugger, this works fine
	let flowName = document.getElementsByClassName("title")[0].children.item(0).innerText
	// for vivr debugger, the title is set by react, need to apply a mutation observer to capture it
	if(document.location.host.match(".*visual-ivr.*")) {
		const titleElement = document.getElementsByClassName("title")[0].children.item(0)
		const title_observer = new MutationObserver(getTitle);
		function getTitle(mutations, observer) {
		  flowName = titleElement.innerText;
		  document.title = 'Debug ' + flowName;
		  title_observer.disconnect();
		}
		title_observer.observe(titleElement, { subtree: false, childList: true });
	}
	document.title = 'Debug ' + flowName;
	removeElementsByClass('footer-container')
}



// remove preview container if only logic
if (document.getElementsByClassName('preview-container').length > 0) {
	// add button and kb shortcut in designer to expand logic or preview
	let keysPressed = {};
	const expandLogic = () => {
		let preview = document.getElementsByClassName('preview-container')[0];
		preview.style.height = 0;
		let code = document.getElementsByClassName('logic-editor')[0];
		code.style.height = '100%';
	};
	const expandPreview = () => {
		let preview = document.getElementsByClassName('preview-container')[0];
		preview.style.height = '100%';
		let code = document.getElementsByClassName('logic-editor')[0];
		code.style.height = 0;
	};
	const expandReset = () => {
		let preview = document.getElementsByClassName('preview-container')[0];
		preview.style = '';
		preview.style.marginBottom = 0;
		let code = document.getElementsByClassName('logic-editor')[0];
		code.style = '';
	};




	const handleKeyDown = (event) => {
		keysPressed[event.key] = true;
		if (keysPressed['Control'] && keysPressed['Shift'] && event.key == 'ArrowUp') expandLogic();
		else if (keysPressed['Control'] && keysPressed['Shift'] && event.key == 'ArrowDown') expandPreview();
		else if (keysPressed['Control'] && keysPressed['Shift'] && event.code == 'Digit0') expandReset();
		else if (keysPressed['Control'] && keysPressed['Shift'] && event.code == 'KeyS') saveChangesButton.click();
		else if (keysPressed['Alt'] && keysPressed['Shift'] && event.code == 'KeyS') saveDescriptionButton.click();

	}

	if (document.getElementsByClassName('preview-container')[0].textContent == 'PreviewPreview not available') {
		expandLogic();
	}


	document.addEventListener('keydown', handleKeyDown);
	document.addEventListener('keyup', (event) => {
		delete keysPressed[event.key];
	});

	if (document.querySelector('.expendHide') === null) {
		console.log('expandHide not found');
		var htmlString = `
			<svg id="expandDown" width="10px" height="10px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="cursor: pointer"><path d="M13.416 17.998a2 2 0 0 1-2.828 0l-.004-.005-9.377-9.436A1.5 1.5 0 0 1 2.27 6h19.522a1.5 1.5 0 0 1 1.06 2.56l-9.437 9.438z"></path></svg>
			<svg id="expandReset" width="10px" height="10px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="cursor: pointer"><path d="M12 0c6.602 0 12 5.398 12 12s-5.398 12-12 12S0 18.602 0 12 5.398 0 12 0zM6.741 12.928l10.48-.001c1.333 0 1.332-2 0-2l-10.48.001c-1.334 0-1.333 2 0 2z"></path></svg>
			<svg id="expandUp" width="10px" height="10px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="cursor: pointer"><path d="M13.078 5.676a1.5 1.5 0 0 0-2.12-.034l-.037.037-9.757 10.136a1.5 1.5 0 0 0 1.08 2.54H21.82a1.5 1.5 0 0 0 1.078-2.544L13.078 5.676z"></path></svg>
		`;
		var div = document.createElement('div');
		div.classList.add('expendHide');
		div.style.textAlign = 'center';
		var div1 = document.querySelector('.preview-container');
		div1.style.marginBottom = 0;
		div.innerHTML = htmlString;
		div1.after(div);

		div.querySelector('#expandDown').onclick = function () { expandPreview() };
		div.querySelector('#expandReset').onclick = function () { expandReset() };
		div.querySelector('#expandUp').onclick = function () { expandLogic() };
	}


}

if (document.getElementsByClassName('interactive-input').length > 0) {
	const expandYml = () => {
		let preview = document.getElementsByClassName('yml-editor')[0];
		preview.style.height = '95%';
		let code = document.getElementsByClassName('interactive-input')[0];
		code.style.height = 0;
	};
	const expandGpt = () => {
		let preview = document.getElementsByClassName('yml-editor')[0];
		preview.style.height = 0;
		let code = document.getElementsByClassName('interactive-input')[0];
		code.style.height = '70%';
		code.style.width = '100%';
		let gpt = document.getElementsByClassName('releaseNotesText')[0]
		gpt.style = "height: 90% !important; resize: none;"
	};
	const expandResetGpt = () => {
		let preview = document.getElementsByClassName('yml-editor')[0];
		preview.style = '';
		preview.style.marginBottom = 0;
		let code = document.getElementsByClassName('interactive-input')[0];
		code.style = '';
	};

	expandYml()

	if (document.querySelector('.expendHideGpt') === null) {
		console.log('expandHideGpt not found');
		var htmlString = `
			<svg id="expandDownGpt" width="10px" height="10px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="cursor: pointer"><path d="M13.416 17.998a2 2 0 0 1-2.828 0l-.004-.005-9.377-9.436A1.5 1.5 0 0 1 2.27 6h19.522a1.5 1.5 0 0 1 1.06 2.56l-9.437 9.438z"></path></svg>
			<svg id="expandResetGpt" width="10px" height="10px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="cursor: pointer"><path d="M12 0c6.602 0 12 5.398 12 12s-5.398 12-12 12S0 18.602 0 12 5.398 0 12 0zM6.741 12.928l10.48-.001c1.333 0 1.332-2 0-2l-10.48.001c-1.334 0-1.333 2 0 2z"></path></svg>
			<svg id="expandUpGpt" width="10px" height="10px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="cursor: pointer"><path d="M13.078 5.676a1.5 1.5 0 0 0-2.12-.034l-.037.037-9.757 10.136a1.5 1.5 0 0 0 1.08 2.54H21.82a1.5 1.5 0 0 0 1.078-2.544L13.078 5.676z"></path></svg>
		`;
		var div = document.createElement('div');
		div.classList.add('expendHideGpt');
		div.style.textAlign = 'center';
		var div1 = document.querySelector('.yml-editor');
		div1.style.marginBottom = 0;
		div.innerHTML = htmlString;
		div1.after(div);

		div.querySelector('#expandDownGpt').onclick = function () { expandYml() };
		div.querySelector('#expandResetGpt').onclick = function () { expandResetGpt() };
		div.querySelector('#expandUpGpt').onclick = function () { expandGpt() };
	}
}

//remove searchbar
const searchbar = document.getElementsByClassName('searchbox-container')[0]
if (searchbar) {
	console.log('searchbar found');
	searchbar.remove()
}

// get rid of the terrible scroll bar for element names
const elements = document.getElementsByClassName('element-list');
for (var i = 0; elements[i]; i++) {
	const ele = elements[i];
	ele.setAttribute("style", "overflow-y: visible; height: auto; border-bottom: 1px solid black");
};

// Make element transitions in debugger vertical and wider
if(document.getElementById("debuggerviewcontainer")) {
	let transitionsElementIndex = 3;
	if(document.location.host.match(".*visual-ivr.*")) transitionsElementIndex = 2;
	const ele = document.getElementById("debuggerviewcontainer").children.item(transitionsElementIndex).getElementsByClassName('content')[0].children.item(0);
	ele.setAttribute("style", "flex-direction: column;");
	const obs = new MutationObserver(function(mutations_list) {
		mutations_list.forEach(function(mutation) {
			mutation.addedNodes.forEach(function(added_node) {
				added_node.children.item(0).setAttribute("style", "height: 100%; width: 90%; padding-bottom: 20px;");
			});
		});
	});
	obs.observe(ele, { subtree: false, childList: true });
}


//add element connected from
if (currentPage.includes('transition')) {
	const flowIdToName = { '6681B1B4-141F-4E24-84D9-68D51325EB50': 'AST - Aged Booking Flow ', 'D2C403AE-399A-4BB6-871D-A312229E1466': "Angad's Hello World", 'C68478D3-88EE-4C49-ADE8-97A7F6EA7571': 'Mazin bkg status chec demo', '2CFF8056-E274-4603-B09A-2CE1A58A6404': 'PropertyVIVR dev', '54F7437E-ABAD-4620-8AC8-E1EE78B27939': 'Check AmendToDMC', 'D557C678-9B7F-441C-B76F-67D50BF6CE85': '[Amend OCC] Contact Customer', '11641BE0-AE38-42E6-9CB3-4F0519276724': 'Flight Cancellation with Post Booking Fee [Draft]', 'FFB90916-52B5-4454-B582-8F50D676AB17': 'OpenaiPOC_demo_1', '960DA7EE-55A8-42C4-8BE4-A5EAC102AE7E': 'Flights Transfer Function', '35E92928-2F3F-45A7-8315-29C9F424A2C3': 'MEEN IVR2', 'ADC110F7-C5A7-43FA-A328-916F084506C2': 'Demo Flow locked by someone', 'D48119D7-7969-4171-A012-E4A95A6353EA': 'Standard UIs for Common SOP', '5DB38D76-A75D-4410-90D4-F94DDCEBC033': 'Cancellation Bcom Grace', 'C8A8F5EB-F38C-47E8-902B-5EF89F18014E': 'FatihNew1', '1EDFA22F-57FA-43F8-A774-DAAF2A12D8F7': 'Imran_1', 'F7A3DC98-ACC8-4E40-A142-E81BE27F3429': 'Amend POS different rate per night SP', '6CD78D15-42DE-4982-B099-927E54F48035': 'CEG Incident handling flow', '0B48D3F9-97C0-4EE3-819C-F183CE5AF830': 'Direct escalations from Pax', '7E8D7267-A264-4CE5-8A07-C837BB8117C6': '[CBDS] Contact Customer', '40C08B4F-C206-4566-A5EB-43FBE95ABDC5': 'Tuck tuck', '11528209-D34E-4B17-9CFD-F93D6CB2AB76': 'CI CD demo concept', 'DC529E73-9814-4847-A747-C911063A5881': 'Jack Function Call', '839467BE-748F-448F-94EE-3F5AF7529E6D': 'rajiv', '182661E8-74CF-4032-B3C0-159F9B6E2D07': "Vanessa's Dummy Flow", '21814361-9C9F-4FA8-8B39-68F24C6AF728': 'Jana dummy', 'CCF5F7BF-B148-45CD-B886-5369CD057EC5': 'Demo table flow', 'FCB751E5-DED1-498C-B41E-14DB102A3AC2': 'New Flow ABC', 'F7AC55D8-7F07-4ADF-AD82-1916BB764357': '[CBDS] Contact Property', 'E62E070D-35FF-48A6-924C-020CCC6F0AC7': 'MD2 New Flow', '6CC95808-33B9-4117-A98F-4335EF842F6B': 'Pallav C2EM', '4EE2D307-FA9B-4B6D-B111-B6E4B8539B80': 'Internal Escalation', '0BCE2942-9962-42AA-AF2A-1BC8B2F14C0A': 'Inquiry Flow - HTB', '2FE158B5-3D60-4812-8541-631C030E0195': 'Amend guest details', '5A320970-BECF-4598-A9C3-65D65F172BD6': 'Property AMA dev', 'EE754BE1-B3DD-4C7F-AA3A-C3C387485949': 'IRIS CHAT FLOW', 'BE0244FA-1A33-4E65-B4B2-E51B931EB8DE': '[CBDS] Cancellation Policy', 'BBEF60AC-05B8-4BB3-A0E6-EA3342C0C78F': 'Fede_0', 'FE150E3B-FBFE-4E03-83F6-3C864F5F832F': 'mint', '6413C967-4029-41C1-BAF0-3E7B9F1E2AC9': 'Gauraw Flow Comparison', '9DBCD8D0-8127-4F6C-9369-E2780E45D5CF': '[DEMO] Amend POS main flow', 'BD3893A1-3A90-48D1-866A-DE5BBA89B80D': 'Amend OCC Main Flow', '6A44D151-5FE0-41CD-A883-18D6CD9384EB': 'Jakub H3 2', 'B8547117-0DC4-4E18-A8A7-1406C3213A7C': 'Booking demo', 'CED26F5B-0B9F-485E-B2CC-AE7A02E82B3F': 'programmingFramework_Object0', '502ABF59-E8EB-4BB6-8962-7FF06AC50E58': 'Jack V4', 'BFDC3FA9-0BE9-4743-8D46-5098B3AE4502': 'Palm', '6F0EB7AF-9659-4DFA-936A-00987F461FB2': 'Practice Matthew', 'EB16AAA1-725E-4044-B7AA-D57256A68208': 'Inquiry Flow - Payment override', '514A42CF-02AD-47CD-8F73-66FCD3EBBA0C': '[CBDS] Allocation check', '9DFAF50F-47B9-44CE-A969-E6525A4BFB93': 'Gauraw Flow 1', 'F7EE79AE-78CB-4761-B687-A2F7235B9E07': 'Police Case Flow', '9865F9D4-EFF8-42A3-84F1-896B5C461F9C': 'ee-umar', '91758135-725D-47E1-BFCA-48FEFC0CEA5D': 'zzzz Top 10 tricks doctors hate. ', 'AB9DA51B-9031-492A-B7C6-0D350B537408': '[Customer Complain] Property related complain', '41E5AB4F-16A2-4861-AE0C-7F50F05A6886': 'Flight Update Booking Status', '04B7E923-85D4-4583-BCE6-19647F3F4D66': 'MD New Flow', '225657A8-4ADB-45E4-84DF-D90552BBA1F9': 'varun', 'A64CDCA6-13CA-41D8-A348-312098298AAB': 'Common FL Tracker', '0659D9FB-5C0C-45A7-921B-99AFC48160CA': 'Jana Programming Framework', '9316A10F-67AA-496F-9653-9469F834077D': 'New Flow - Wizard Academy', 'A2357A5B-7B7D-4C4E-8073-51DDDE0BFFA0': 'Tech Ask for help', '1F368CC3-0100-442C-89AB-EAEB26BBA0DB': "Vanessa's New Flow 2.0", '2FDC597E-3D97-4D66-AB31-BF17A4FDFA4C': 'Visual IVR Booking Details - Ivan', '4644A9C0-8E63-4923-90EA-6214EC4FBC77': 'Wizard Academy [Assignment]', '94EC327F-E7C5-4676-BB9A-146915B29525': 'Example of for loop to format table', 'F3A320E9-9CA6-400A-A76B-BF209F711C1B': 'DEMO Tech Talk', '6E361C40-1132-4D68-80CE-F308453AEECE': 'Demo Flow with owner permission', '102D257E-7608-495B-8F6F-48AEB6A950BF': 'Amend POS contact customer', '122E62CF-7922-4669-AB71-49016738FFB8': 'Foremost 6', '00B9BB21-0E24-4DBC-9A3B-E9523868E0A9': 'Foremost 2', '65371AAD-21DC-44AA-A091-82F4D6E56C68': '[Amend Name] Property/SuperAgg Decision', '6D85462E-F0F6-4097-82B7-37FB7AC50361': 'Visual IVR Contact The Property', '8AF6810C-DB01-48CC-B9A0-2D16C1A40CF4': 'Flight Absorption Tracker', '6DC834CB-6204-4582-B096-E1B302EB10E1': 'Foremost 4', '46D47D19-B202-4A0E-9B0C-061A1EBB21E4': '[CBDS] Check details', '69DAA4B4-939D-4875-9C6F-2B358849BD10': 'Tech cashback escalation flow', 'C0C27410-2364-474B-B8EE-B865F464BE12': "Ivan's IVR Flow 1", 'C58FCAC6-81AF-4ABB-8720-E08032006B4A': 'TC Ping Email Subject', '2BC6979E-6769-4E9D-8572-AB932E78717B': 'Visual IVR Case Status', '8054A557-7601-40B5-B123-B83CFDFED31A': '[SF] Flights Calculate Payment', '48727C46-EF30-4AE6-B2AF-33959AFD19AD': 'programmingFramework_Object', 'BCC25F6A-CA49-4CA7-89E6-C81673FA789F': 'Service Model', 'EA8851C7-0A43-415F-8476-DEFC469E1AA1': 'Demo Flow with write permission', '7310B2A4-BB4A-4E58-9A4C-7656E34D5457': 'New Flow MD Wizard Academy', '0BD3CEC7-88BE-4FD6-92DF-F140F83282C5': 'Amend POS CR Pax wait for prop resp ', 'E14CD4B3-F0D0-49AF-9703-0F62EFFB0E7C': 'V-IVR handoff agent view (duplicate)', 'C51A6E20-179A-41C1-9CDB-87A577EE2562': 'Amend POS', '63057B34-C475-43CF-B48E-985EE4AEB59C': 'Irina training', '5B4B25B1-2EA8-4C4A-AD32-A90926AD389F': 'RT-LX-1', '173B96A7-0C3E-43A6-8433-6FB652144D27': '[ARCHIVED] Flights Booking Processing', '1170A0B2-7ABF-452E-ACA4-146CF2C1D1BD': 'Allen Escalation Side Flow', '077F4089-DAC7-40AE-B496-59A017C30226': 'Debug - Visual IVR', '44E1A706-6190-4112-A3B4-86F89BF337DB': 'Flights Cancellation Calculator - Pending Action', '6E855D89-19EF-491D-A854-AEC174E4D49F': '[Customer Complain] Missing Benefits', '6E09DDE2-7603-4E41-A412-892F9F7A286F': '[AST] [V-IVR] YCS Access or Contacts', '63ECFC58-099C-4D9C-8BBF-4B87977851FC': 'PS OPS Form ', 'F626D708-ABFC-4299-B057-56E68BAAE256': 'Cancellation Agoda Absorb', 'F31DAFE1-32A2-4C68-A362-8F89948D5D7D': 'Frontline Escalation', 'BF6810F0-8700-4FF6-89B1-CB17AD2680D9': 'TC Ping Tool - chat', '14918561-49F8-4E2F-91D6-0BAC1B66B6E4': '[Cancellation] Main Flow', '47CC76EF-C5B6-4ECA-B3B7-712ED3FD7221': 'Citi Customer Verification', 'C111D954-AD65-4183-978D-1D84628C2D38': 'Amend POS contact pax', '07C1E739-E0ED-4730-A5C5-DE8FB36C9017': 'Convert 2x2 array to drop down', 'D24D6BE1-BB7F-48AB-A568-8659214C450F': 'Anirudh V-IVR', 'EDF7487B-F8AC-447A-ADED-48830389BBC0': 'Jakub H3', '2AB7ED5B-BF07-4F67-97B7-664D9AEB6D00': 'Prof. Lada session 1 - Jakub', 'C27B9669-94F2-4757-8E1B-649A29822772': 'Tech - Headset Issue', '24108537-E898-49C8-A93C-A5BEF098B8EA': 'New Flow Joe', '1196929A-C7B0-4409-817B-ADEAE668626B': 'AST Incorrect Rate Prepare Absorption', '82FE1DAA-6076-4719-B340-CCE0648C6EBC': 'Greg Homework 3', 'E4FE7AC9-8FE9-4B93-A70C-0324EF7D2FC0': 'Bill Mock flow', 'E5EFD06F-42B3-41E8-A540-212B3BD08E21': 'Charges tab', 'F5109682-B988-45A7-A21A-AAE181C20020': 'Foremost VIVR 2', 'AA90039D-B2F7-4C09-88E5-C493042295B0': 'firstFlow', 'E95BF271-B743-41A3-9A33-5CE1123BB4C7': 'WIZARD4854', 'AC1FEA22-198A-4D8D-98B4-116BE084CD03': 'Kgarg_DynamicTableFlow', '6D56D29B-DB85-4825-85CA-24D28342933E': 'Payment escalation', '7B8B1AD9-BBBC-405E-BAE5-65F2528852A4': 'Foremost 5211' }

	const createConnectedFrom = (elementName) => {
	let tmpDiv = document.querySelector('#connectedFromDiv')
	if (tmpDiv) {
		tmpDiv.remove()
	}

	var connectToPannel = connectTo.getElementsByTagName('li')[0]
	var connectToBox = connectToPannel.getElementsByTagName('div')[0]
	connectToBox.style = 'height: auto; padding-bottom: 20px;'
	var div = document.createElement('div');
	div.classList.add('sc-hlGDCY');
	div.classList.add('iCsbmk');
	div.id = 'connectedFromDiv'

	const flowName = window.sessionStorage.flowName
	const flowDetails = JSON.parse(window.sessionStorage[flowName])

	let connected_from = {};

	for (let [key, value] of Object.entries(flowDetails.transitions)) {
		if (Object.keys(value).length === 0) {
			continue;
		}
		for (let transition of Object.values(value)) {
			if (elementName == '0002 Intro SF END') {
			}
			if (typeof transition === 'object' && 'subflow' in transition) {
				sfId = 'SF_' + transition.subflow
				sfName = 'SF_' + (flowIdToName[transition.subflow] ? flowIdToName[transition.subflow] : sfId)
				nextPage = transition.nextPage
				if (!(nextPage in connected_from)) connected_from[nextPage] = [];
				if (!connected_from[nextPage].includes(sfName)) connected_from[nextPage].push(sfName);
			}
			if (typeof transition === 'object' && 'mainFlowId') {
				transition = 'SWITCH_' + transition['mainFlowId'];
			}
			if (!(transition in connected_from)) {
				connected_from[transition] = [];
			}
			if (!connected_from[transition].includes(key)) connected_from[transition].push(key);
		}
	}

	const elementFromList = !!connected_from[elementName] ? connected_from[elementName] : ['Nothing connected to this element']
	const elementFromListDiv = elementFromList.map((element) => `<div style="margin-top: 10px; border-bottom: 1px solid black; text-align:left; padding-left:10px ">${element}</div>`)

	div.innerHTML = `
                <div class="key-container" style="width:100%">
                    <div class="sc-iidyiZ jXZPoB"><span class="sc-jRQBWg hEGTwu">Connected From</span></div>
                    ${elementFromListDiv.join('')}
                </div>
            `
	connectToPannel.appendChild(div)
}

var observerTestChild = new MutationObserver((mutationsList, observer) => {
	for (let mutation of mutationsList) {
		const elementName = mutation.target.data
		createConnectedFrom(elementName)

	}
});

var newDOMToObs = document.querySelector(".jXZPoB > span");
if (newDOMToObs) {
	observerTestChild.observe(newDOMToObs, { characterData: true, attributes: false, childList: true, subtree: true });
}

var connectTo = document.getElementsByClassName('gXgqKp')[0]
// Create a MutationObserver instance
let observerTest = new MutationObserver((mutationsList, observer) => {
	for (let mutation of mutationsList) {
		if (connectTo.innerHTML == '') {
			observerTestChild.disconnect()
		} else {
			newDOMToObs = document.querySelector(".jXZPoB > span");
			const elementName = newDOMToObs.innerHTML.replace('Keys', '').trim()
			createConnectedFrom(elementName)
			observerTestChild.observe(newDOMToObs, { characterData: true, attributes: false, childList: true, subtree: true });
		}
	}
});
observerTest.observe(connectTo, { childList: true, subtree: false });
}