// functions to set tab name and favicon
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

function updateTabName() {
	const currPage = location.href;
	const currPath = decodeURI(document.location.pathname);
	const currHost = document.location.host;
	// first check if we are in the designer tool or debugger
	if (currHost.match(".*wizard-designer.agoda.local.*")) { // designer tool
		// use flow name if user is in transition or node editor
		if(currPage.includes('node')||currPage.includes('transition')) { // flow editor pages
			let flowName = currPath.split('/')[2].replace('Cancellation ', '');
			while(flowName.length>30) {
				flowName = flowName.split(' ').slice(1).join(' ');
			}
			setFavicons('https://cdn-icons-png.flaticon.com/128/1680/1680365.png');
			document.title = flowName;
		} else if (currPath.split('/')[1] == 'integrationPoint') { // API Builder page
			setFavicons('https://cdn-icons-png.flaticon.com/128/9110/9110100.png')
			document.title = 'API Builder';
		} else if (currPath.split('/')[1].includes('deploy')) { // deployment page
			setFavicons('https://cdn-icons-png.flaticon.com/128/4471/4471714.png')
			document.title = 'Deploy';
		} else if (currPath.split('/')[1].includes('workflowTable')) { // deployment page
			setFavicons('https://cdn-icons-png.flaticon.com/128/4471/4471714.png')
			document.title = 'Workflow Table';
		} else if(currPage=="https://qa-wizard-designer.agoda.local/") { // home page
			setFavicons('https://cdn-icons-png.flaticon.com/128/1680/1680365.png');
			document.title = "Wizard Flow Designer";
		}
	} else if (currHost.match(".*agoda.*\/wizard\/debug.*")) { // debugger pages
		setFavicons('https://cdn-icons-png.flaticon.com/128/1541/1541402.png');
		// for agent debugger, this works fine
		let flowName = document.getElementsByClassName("title")[0].children.item(0).innerText
		// for vivr debugger, the title is set by react, need to apply a mutation observer to capture it
		if(currHost.match(".*visual-ivr.*")) {
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
		removeElementsByClass('footer-container');
	}
}

// Set function that runs every 500ms to check for a change in pages
let currentPage = location.href;
updateTabName();
setInterval(function()
{
	if (currentPage != location.href) { // page changed
		try {
			const flowName = decodeURI(location.pathname.split('/')[2])
			if (!!flowName && typeof (flowName) == 'string' && flowName.length>0) window.localStorage.setItem('selectedFlow', flowName);
		} catch {
			console.log('error setting flow name in session storage')
		}
		currentPage = location.href;
		updateTabName();
		if (currentPage.includes('node') || currentPage.includes('transition') || location.href == 'https://qa-wizard-designer.agoda.local/') {
			// auto-refresh page if its in the node editor or transition editor (changes only get applied after a refresh)
			location.reload();
		}
	}
}, 500);


// Fast save code below
// First check if we are on the node editor page, for performance reasons because we set a mutation observer
if(currentPage.includes('node')) {
	try {
		//skip confirmation pop up except transition
		const realConfirm=window.confirm;
		
		if (decodeURI(document.location.pathname).split('/')[1] != 'transition'){
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
		console.log(e)
		console.log("ERROR")
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

		if (document.getElementsByClassName('preview-container')[0].textContent == 'PreviewPreview not available') {
			expandLogic();
		}
	
		// document.addEventListener('keydown', handleKeyDown);
		// document.addEventListener('keyup', (event) => {
		// 	delete keysPressed[event.key];
		// });

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

		try {
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
		} catch (e) {
			console.log('resizing gpt error\n' + e)
		}
	}
}


if (currentPage.includes('transition')) {
	try {
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
		if (document.getElementById("debuggerviewcontainer")) {
			let transitionsElementIndex = 3;
			if (document.location.host.match(".*visual-ivr.*")) transitionsElementIndex = 2;
			const ele = document.getElementById("debuggerviewcontainer").children.item(transitionsElementIndex).getElementsByClassName('content')[0].children.item(0);
			ele.setAttribute("style", "flex-direction: column;");
			const obs = new MutationObserver(function (mutations_list) {
				mutations_list.forEach(function (mutation) {
					mutation.addedNodes.forEach(function (added_node) {
						added_node.children.item(0).setAttribute("style", "height: 100%; width: 90%; padding-bottom: 20px;");
					});
				});
			});
			obs.observe(ele, { subtree: false, childList: true });
		}
	} catch (e) {
		console.log('removing searchbar or remove element scroll or debugger vertical element error\n' + e)
	}

	//add element connected from
	const flowIdToName = { '66C24871-5993-4896-B3C5-6A11B28BBD41': 'Cancellation Waiver Denied', '200C207D-D606-4AF1-A706-21FCBB0FBBD9': 'Visual IVR Resend Confirmation', 'BF176DE2-530F-4809-8400-982694B74BA3': 'Pending Action SF', 'E823EC1B-6D3E-4ADE-8BE8-DEDCABFCB999': '[AR] Incorrect Rate', 'F00960F8-A280-4E75-925A-DD4643F1C81F': 'Wiki Links 3.0 SF', '1B54ADFB-192B-42A1-80B0-0C186574A5CF': 'Amend Name Confirm Amendment', '289F5E13-AEFE-458A-9B29-7129A9218345': 'Amend POS check allotment', '8FABB53B-2E09-4543-B28D-25DB9D65C324': '[AST] [CF] Return to Flow Start', 'D40D6898-2950-4504-81EA-8D1CB09EF4C1': 'Reservation Not Found - Resend Voucher', 'EDD7E577-96B3-4C2F-80D0-8D9448C24281': 'Inquiry Flow - Refund Investigation - Bcom', '19220ECB-1D04-4A15-B25A-D02FEF216874': '[AST] [V-IVR] Rates and Availability', 'F3B802AF-354F-43D1-8CA3-73D119DF1A50': 'Flight TTA SF', '67356DCF-F2AA-4562-A26F-E289255199ED': 'Inquiry Allocation Flow', '725D1324-CE46-428F-89AA-DEC5F3DF65D2': 'Visual IVR Add Guest', 'E2AF70A9-2965-4FA9-9ACF-3CFCE00F35F1': 'Amend POS experiment', '8E28ADF0-8BA5-4AF9-898F-654778740E08': '[SF] Flight Reissue Auto Fraud Check', 'B36C87A4-2138-4DC1-ACAC-B20E4375B9DF': 'Flights Cancellation Agoda MMB Refund', '87ACC019-CADA-4F92-8648-1579E63DBFDE': 'Debug Edit Variables', '576FBF3D-A5D0-4378-9570-220D36D0472A': 'Save Case End Page', '95FA91C4-DB96-4528-A70D-0ADF9EB98F89': 'Special Request Main Flow', 'C720FDA9-EA82-4620-AF2E-D661CBD4515B': '[Complaints] Cancellation Request Flow', '7A6DE2BB-5322-40AF-9BE9-8D027F07C870': '[AST] PAC Manager Flow', '569AE444-7E52-4FDB-BBE3-346B64A07BA7': 'rawn-flow', 'ECDA7AD7-F602-481E-8893-2458FECD3E2B': '[AST][V-IVR] Payment Inquiry - Activate Ecard Mini Instruction Subflow', '270F6DF9-282E-4CBA-954B-21450B880C10': '[Amend Name] Property Decision', '64E42BF3-FF6B-43EC-9CB7-56B945ADAD9C': 'Cancellation Manual Partial Waiver', '34C8DE5D-C8DE-42E3-9121-D30471C7FF91': '[QS] Update cancellation policy', '66A0E4A6-AF3E-4388-A455-83671DEFC47E': 'Amend RT Cancel and Rebook', 'FE22DD55-50E5-4D15-9C9C-89358D490565': 'Visual IVR ChatGPT Deflector', 'F9ED55A6-7AAA-4020-BDAE-C4076D4865F7': 'AST AFH Consultation Tool', 'DB343A18-05C9-429B-B214-2A4BB66069DD': 'CST Mini Actions - Compensation', 'C5D1096E-4B92-45B7-9116-E8B9E8357A4D': '[AST][V-IVR] Payments - Payment Inquiry Subflow', 'BC02C28C-7B0E-4E2D-A8E8-B255BA1B6F23': 'Flights Compensation', 'DD0026A1-196A-4C66-B9CE-1C7BC083FCF5': '[AR] Send Email', '79C08471-7395-4CC2-A37F-9335BA2FA598': 'Flights Insurance Vendor Detail Table', '6E4CD94C-FCC4-4C94-B9D4-E0936E8BF5B7': 'B2B Detail Table', 'D5140CBD-A340-49C7-9822-C4398F9A0B11': '[Complaints] Allocation check', '05E8410F-1B80-4257-9A1E-399B07EB4E89': 'AST Contact Back', 'A97CE6A6-7557-420E-872B-5C65DEAE6FB8': 'C2E canned responses', '4F588E90-6339-4FD7-9C2D-80C0AE9D3E2E': 'Chameleon Unbabel Escalation', '1F648C30-FF29-41AB-A486-8864CC495D6C': '[AR] [EXP] Allotment Closure Allocation', '685376F8-A66D-457E-B2C7-E33644FE3B01': 'jack chatbot', '42E0790E-6D9B-4B53-B991-736A4A987ABB': 'CST Intro', '4F6C7F1D-1387-408F-AFD9-59E635DFA96C': 'Directly with Airline Refund', 'ED9CF832-708E-4F59-854C-E4DB0108D1D5': 'RoomType&HotelBenefits', '51BD02FE-2C93-4F7D-A11E-F7EC5CCA96B9': 'Amend RT Send Email', 'EAE36830-9619-4975-B12D-8B115D80964C': 'Update Booking Status', 'DFE631AF-9223-4160-9325-CEA5A8993C57': 'Empty Variable', '5FCCCDF7-3156-4063-A923-072866CE07CD': '[AST] [V-IVR] [CF] Display PHub Links', '13A4E065-057B-4DA2-AC28-B0BDFCF9B5B5': 'Amend Name enter details', 'DD2BFFC2-02B8-45C5-A87D-F55F75D8697C': 'Cancellation Contact Customer', '9A9B84F4-7B87-42BC-AE5F-2FBA260AE4CF': 'TC ping tool chat', '95B2943C-A890-4CC6-B3CB-75F1ED517256': 'Messaging Transfer', 'DF066207-E6E5-4976-8AAC-3D6D5D66BD53': 'Flights V-IVR Booking Confirmation', '7C87372C-8962-435A-B2BB-362DC4B9C7CD': 'Partner Contacts', 'CFEC032F-715D-4AB2-AD59-3880A89A2521': 'Visual IVR Main Menu', '35D8C79A-CD52-4576-9F40-DE01EAF15E9D': '[Complaints] Contact Property', '0B92A626-E767-46D2-B62F-74E1A187064F': 'Flights V-IVR Contact Airlines', '4655ED31-9E44-4826-887F-D38B22F45623': 'Cancellation Agoda Absorb First', 'AA043C76-B7D8-4DC8-AB0B-0E7352A4522F': 'Edit booking documents', '19F93B47-BA36-465F-A460-D251AF53AE2E': 'Wizard vCard', '9E0270E9-6B1B-40C3-A790-3CA32CC1971B': 'Visual IVR Check-in Check-out', '1E2D3AC8-1C50-482D-8BB1-290B5E876539': 'Secure Link (SL) subflow', '7BBEDD5E-ABD7-42FB-9E72-C9FD5D4F1353': 'Amend POS confirm amendment', '5A0D3365-8CC3-43FA-9AAA-4EBCB4566320': 'Visual IVR Check-in-out', '2DF95665-6259-4C2F-8826-FF521F446023': '[AST] Error Specific SF', '2896DB39-FB22-43B8-BB1A-467BD072C801': 'Amend Name Nationality mapping', '599E7364-0775-48BD-823F-20FD8EE980A2': 'Charge Reversals Secure Link', '201E7061-CE9C-4EBE-BD4D-0110195A7714': 'Amend RT Amendable Flow', '1668FCF3-5526-4FC1-B6F7-5C481C55AC78': 'Messaging Assisted Sales Agent Flow', 'CFB639FD-122C-4622-BEB9-A291EC0A1152': 'programmingFramework_Funciton', 'E3CD1511-0D4C-46BC-B1F1-A984CB740798': 'Foremost 5', '572968DD-8508-416C-BFDE-8211D4451368': 'Flights Cancellation Main Flow', 'B80DC98A-228B-4503-8221-4DEA8877DE46': 'Amend POS Urgency Criteria SF', '0E64DE0E-A998-4C29-B47D-A67BE3C8960D': 'Add Credit Card', '412D9B53-5D7B-44C3-A081-169D295E93BC': '[Complaints] Absorption Guideline', '428F6162-D2C8-4E07-BDAC-D09B54628B81': 'Visual IVR Special Request', '3A528593-2929-4E73-A3B3-70E14D2BF056': 'Amend RT Contact DMC', 'BB6BA959-6CC9-44E2-8562-DE6EA01C4C26': 'Inquiry Flow - OTC Refund', '917B3C0C-BE86-4F5D-941B-BE1C7844C42A': 'Cancellation PCFW', '4FF26D7D-DFD1-465F-9563-42FE4B1AD912': '[AR] TC Ping', '84C8F377-D94B-4941-A6B3-CE3CF1097F18': 'Element Connected From', 'D2F192CF-493E-4C17-9930-6F40FAFA6A80': 'Mock YCS AGP Program', 'A76AF99F-9015-4632-9CC1-6BBAA72F154C': 'Tuck Debug - [AR] Main Flow', '2B8FE705-CD5B-49CB-8103-A5E8B0AD871B': '[AST] AGP Program Inquiry', 'C5B51A85-FEF4-4B1C-9D85-21348307EAA3': 'TOBO migration prototype', 'CB0406CB-3D89-4E11-A8ED-FD058823282D': 'Inquiry Flow - Customer Decision', 'C42A045B-6CBE-4D34-B3A9-58CE0001CCF0': '[AR] Contact Property', '704E3F50-E454-4127-B63B-A05892FBFFC6': 'Flights Athena Logs Check', '1010F8BF-653B-41F9-99C8-A1CA1847E3A2': 'AST Escalations SF', 'A52CEC0B-612B-47DC-A146-5861D2F18B34': 'Mike Sandbox', 'B6057164-55ED-4E38-A1ED-6914AE228A38': 'Reservation Not Found - Contact Supplier', '4AADC582-FFBE-41C2-88F9-D786DC1FD01E': 'Flights VIVR Payment Info', 'F774113D-F50E-4012-90D8-D01CC67197A5': 'UPC Status Canceled SF', 'C112189D-36A8-498B-8F23-C7B340B87236': 'Visual IVR Refund Info', '07E3C8E1-BCA3-4567-89F5-FFF5EE207186': 'Amend Name check policy', '840389F1-3562-4E92-BD88-39DA19D6DD1A': 'Cancellation Validate Document', 'C2B41B5D-B7FE-469E-8376-860C91E1CDC5': 'Keyboard Shortcuts Demo Flow', 'CE3E743F-E904-438F-A81C-8D7DF0329CB8': 'Flight Action Panel', '8F536222-BF08-4C6D-828F-CFF55F0C44C3': 'backoffice_main', '7BA0A3FA-258B-49CA-901E-04C8ECBA0B96': 'My new flow', 'DD237391-3E0B-410D-8447-0445073BEABA': '[AST] MCC SF', 'EB337321-0ABC-4DCB-B700-D4CBA64A579F': 'M150 Flow', '599BAE65-9920-46D8-BEDA-2BD814DAD6D9': 'Cancellation Cancel Booking', 'B7E354EF-4A9E-4EE7-B080-22C8B6FF9A68': 'Amend RT HTB', '17DA2AED-54E9-4BAE-806E-A5F9D8DABF6E': 'AST Default Flow', '23CC879C-CD22-4C44-B2BE-52D36352E68C': 'Visual IVR Cancellation', 'CD7A4405-2885-4867-B46F-E9A7C0356925': 'Amend Name HTB', 'A6D9BC9C-D9F2-4D76-8220-D6039C478321': 'Amend POS main flow', '76A27391-D122-4B19-984F-C49F5F775A02': 'Cancellation DMC Decision', '46222B1F-C4F0-49F0-A1B1-C20D3BE76543': 'Return to Start ', '675C3AFE-147F-4EBF-BF1A-B7FEF11F26E4': 'Cancellation Bcom', '36C0FDC9-8730-4B1A-8306-B27CB9F0A49A': 'Cars mini cxl flow', '1B881F17-DA47-4680-96D5-53DBD73C0E64': 'Flights logged In', '48940CC1-3F71-4434-A272-78D498D8B48E': 'Absorption Control - TC PIC', 'DF18E021-4204-4D16-9B53-D3BE97E9C42B': 'TC Ping tool chat interface', 'A3F82E8B-06D4-4B1D-9AC8-EDAAB23E211E': '[AR] Contact B2B', 'C38BC1A9-3AA4-4CA9-958B-787213887E82': 'Flights Itinerary Continue', '2E35DF37-C76F-4B15-8247-400BAFAB3018': 'Amend POS different rate per night', '82B85D08-EFC4-4A51-B324-54AC5B39C667': 'Flight Pending Transaction Flow', 'C3BD9E64-5A19-4326-AAA4-3CC94A25B0B7': '[AST] [V-IVR] Policies, Notes, or Special Instructions', '924C8117-E6F8-43C2-99C0-137ED6BBFE5C': 'Flights VIVR Common', '6CAEAECD-0905-43CD-B915-BCB35501E5E8': 'Amend POS pricing breakdown', 'B70A6C37-622C-4F32-81D0-7E31247E163D': '[CBDS] Check status', '79565ADF-DB76-4DC8-AFF0-3200749EB660': 'Visual IVR Hotel Contact', '98F5AFFB-FFE2-4C06-81A0-291B022503DE': '[AST][V-IVR] Payments', '1AE29151-1645-492A-BB1B-ED7DC6DB233E': 'Follow Up Tracker', '0D86A99B-5E38-4907-9AB0-3367D945CB0C': 'Activities cxl flow ', '034C3606-E089-4E16-94DC-0F73C32F429F': 'Training Flow', '2C4CAEA1-D059-41DD-82AB-00A3B93BE962': 'Automation GPT switch', '68B046B4-B4C0-449D-B3CB-7A287AF6320B': 'Contact Back Hub', 'FC857F90-31B8-41D6-9FB1-EA85643CCB2D': 'REMOVE AFH Demo', '863AC1B7-6C91-487B-B143-36D060D002C7': '[AST] Cannot Charge Telex transfer SF', '356A93FF-680E-4E3C-B586-F59E2528C86B': 'Cancellation Main Flow', '4A29DAD9-0D9C-4935-9C52-D2E349E2371A': '[AR] SST Logic', '691A9511-6A07-4483-A336-993E77A49158': '[AST] Cannot Charge Main Flow', 'A2F2CD48-3341-4541-98FF-C17273D1E2E4': 'SR allocation flow', '6985E425-D900-4B50-9649-767388CA992B': 'Amend POS send email', '4750D803-03D7-46AC-B31D-A06104D868F3': 'Setup eCard SF', 'A541BF53-FCCE-4E4F-8A28-E16D910C5528': 'Foremost', '604B125A-5261-4CE7-B013-16C1A507F5B6': 'Absorption Control - Agent', 'B34E24AB-7222-4AB8-A73B-3850470F3FC4': '[AR] Mini AR', '59718FDC-BAAA-44BE-9A55-6BB359FF555F': '[AST] [V-IVR] Bookings and Reservations', 'D918EF0E-3F1C-4A7F-A03F-B7A32D52D477': '[AST] [V-IVR] Rate Dispute', '03F57CA4-1B70-467D-B278-47D6FF9637F6': 'Flights Cancellation Request', '110BF454-3CD7-4B39-ACE0-5447DF51AFB5': 'Cancellation Offer AC Email', '8409077A-4568-4C02-A6E3-81412D6E99FF': 'Amend POS calculate charges', 'B49B6080-CB5E-48D1-A908-D885CCCAFB34': 'Flights Cancelled by Customer', 'E1EB9450-BCA2-47F0-8FB2-B8933F74CEB7': 'Cancellation No Waiver Negotiation', '6380349C-75E1-421C-B0F7-FC5891EFCE2B': 'Flight Reissue End Subflow', '61763AD3-6F89-4374-864D-DCD6A22675C5': '[Amend Occ] Contact SuperAgg', 'B5CFE46F-DC8E-49A3-AF45-833428322BCF': 'Reservation Not Found - Main', '5132F721-BBE0-4C49-B8F4-5CFAC1787DE2': 'Amend POS ASQ', '3BBFB89E-C38C-4C17-A9A1-2794CDEE9D21': 'programmingFramework_Array', '2F751621-61D0-44E0-B1A3-E02700C26938': 'Flight Reissue', '8E4B89A7-B766-4A52-BDC3-26A60B9675CB': 'Follow up tracker allocation', '354F3643-6FE5-4441-9F4A-543A7B705E2D': '[Outdated] Amend Name send email', '24C7C538-CD89-44CA-99B9-8D85FED1C830': 'Amend Name Bcom', 'FB99B200-81FA-4605-9FF1-7F3F507BBACD': '[AR] Allotment Closure', 'BC75AD75-2CB1-42B0-BA3E-1C9A8FD632F0': 'Flights Intro', '1666567A-30A3-4385-9394-3FBECCC4E144': 'Amend POS check policy', '11CB508E-423B-4266-A2E7-A9EF1C9D634B': '[Amend Name] Contact SuperAgg Non-Bcom', 'A3054A70-938D-4128-83AA-7B85841B4BCD': '[AR] Pending Case TOBO', 'C6CB2511-F2B3-4D7A-B01A-6626C78AE649': '207814', '4CA207E0-2C76-48FA-8AF0-04ADA84B92D0': 'Flight Confirm Booking', 'CEFC113D-0A3A-42ED-9B1D-8130D588C7BA': 'Mock Property Policy Note', '0AACE4C8-AE12-4A7B-9777-706138841286': '[Common] DMC B2B and Campaigns', '919EAE80-FC4C-4DDC-9CBC-B6ACF71983AC': '[QS] Send SR for Mini Action', 'C3CD8821-9FF3-4097-B9AD-271F8EA88CE7': '[AST] [V-IVR] Main Flow', '109ADC0A-D8B0-4175-A1A0-06F998659801': '[AST] Amenities and Facilities Inquiry', '6DADCAF7-5459-4624-892F-FCD7C4E34571': 'Sarah Cathy Playground', '38E43301-7C6D-42B3-B3E4-47CA152EB4CF': '[QS] Send Quick E-mail', 'F9197918-7DF6-4598-8EC5-E6CB0233683F': 'AST Change Payment Method', '66F2F21D-B269-4465-B6B1-DFC35984FF55': 'Citi Benefit Refund', '3187C67B-A253-45ED-A1C3-E683124FB744': 'Paypal SF', '0CFD87B3-6D03-432E-96D7-8184A221F950': 'AST Intro', '2280B91A-1CD0-4EAA-8B31-91C32E514110': '[AR] Resolution', 'C1DA4C9B-5AAF-4BB6-B209-336D50ECC624': 'Reservation Not Found Mini', '18952E99-2951-4808-B3C4-F220FE7135CB': 'Supplier Detail Table', '9937A1CD-BFCF-4E8D-8F4E-93A9CB635BBA': 'Get Flight Fees', '47A9175B-17A2-4542-A074-79BDFB56C56F': 'Amend POS enter new dates', 'C7B470F2-093B-4CCD-ADF4-4F8256CC5AB5': 'Partner contact update', 'B92640CD-0FAC-402C-861C-8F645055AE52': 'Cancellation Contact Property', 'EEFCDC17-9846-48C1-96E1-E1E96EB77238': 'AST Approver SF', '0087281E-6CB8-4D33-8760-7761993FEE73': 'Mismatch Currency on YCS', '11F29188-8BCF-4CB6-987B-F378547F3664': 'Get Flight Cancellation Data', '9E84880B-128B-4978-B6F4-5817FA2C59AB': 'Partial Charge UPC on ePass', '17D81234-D26E-4CA9-9574-47EA534EB0B4': 'Handoff API Amend Name SF', 'E9BE8E54-8F50-4AC3-825F-5B80306A0D41': 'CST Transfer Function', '2B59A3E2-94A3-44F4-9DF1-2406482D5388': 'Visual IVR Contact Agoda', '72DC5304-63C4-4276-B0A3-963F9A475A26': 'Global Functions', '176F4E1D-AC21-4995-9C27-51EA92FBAD6D': 'Messaging Assisted Sales - V-IVR', 'F626B436-0A55-4D6D-A3E3-D29EA62F3C1D': 'Flights V-IVR E-receipt', 'BF7C7391-6703-4422-AAF9-043757E8A39B': 'Inquiry Flow - B2B Decision', 'A86E18F6-2A0F-4CC9-82EF-DE47B797EF24': '[Outdated] Amend Name ASQ', 'AAD5BE24-67BC-4E9F-A590-F359A447D8BB': 'Flights Booking Confirmed', 'B931F989-0BCD-45B2-B884-86CF468709A7': '[AR] Contact Customer', 'B964A6DA-ED0E-4FEB-AAFD-4BF0F7FCDEDF': 'Inquiry Flow - APIs', '4C62D6BC-8ACE-4E89-98E3-03A59FF54048': 'AST Incorrect Rate Investigation - System Log', '40AD804C-47EC-4173-9772-477A35886FFA': '[AST] [V-IVR] Rooms and Settings', 'F9A3203D-0628-4E2F-9062-09CD6FC742F5': 'Inquiry Flow - Property Decision', '75F88FD3-E50E-4FDF-869A-C1AC5819CC41': 'AST Mini SOPs', '3FF65030-EDFF-4528-A6AD-CABCAA5A0698': 'TC ping tool', 'B4C9124B-1C75-496D-AD86-643FF182C1A6': '[AST] [V-IVR] Channel Manager', '3F1608EB-8877-4C9E-AA69-82F0A051F918': '[AST] Epass Request SF', '2057D01E-CF48-4686-BDAC-B145F346A142': 'Flights Cancellation Cancel Fare Rule Check', '17169806-F044-42F9-A924-6248B19A37C4': 'Flights V-IVR Refund Info', 'C9560397-5D72-4C01-BF79-7D025AB72BE1': 'Setup Paypal SF', 'BD7C7617-EF5B-4C2D-88E8-84F09F4D7D3A': '[AR] Relocation', '748B3760-0B84-40C2-9339-17E4F6CDB90F': 'Recfm Amount Charged UPC', 'BB0545A8-CDAD-454E-9B3E-81AAFC338A75': 'AST AFH Transfer Tool', '5EC6EA90-D4F6-4421-9389-2D699066A2C4': '[AST] Open Payment Request SF', 'AFE3850E-1B02-4736-A0A1-7996642E18DC': '[AR] Check future BID', '162DECB2-47B3-4DF8-86F3-4941FB0D92F8': 'tes', 'CDF87486-A845-4A13-9C4F-DED0C71A0F78': 'Flights Cancellation Split Submission', 'BBF4ACB1-A9E3-4614-936B-8B5D6B44649A': 'TC Ping Set up', 'CF41D84D-76B3-4DDC-83F2-4CDD97E782D0': 'Flights absorption tracking', '7E83D365-7402-4CC0-A16E-7D3F1CF7D1AA': 'Visual IVR Booking Details', '42F6B324-220C-4987-9D33-B39E8155B467': '[AST] Non-action - AI Program Inquiry Request', '057BE33D-C453-4D29-AAF5-075B2486A5BB': 'Flights Quick Email', '90BBFF15-46D8-4FF9-AAB3-FE7F6D8127B0': '[QS] Solution tracking', '521C95CD-0672-45A2-B25D-7197B9014E00': 'Visual IVR Global Functions', '05125644-1B21-42FF-9B97-FAB1ADA74122': 'LP widget', '7E1A149B-4B83-4516-97F6-DD87B4F5459F': 'Replace UPC API SF', 'A69365A4-1AC6-4658-AD70-8710279B899F': '[AR] Contact SuperAgg NonBcom', '3F953786-CE12-4127-9DAE-0F1F635328D1': '[Amend POS] Mini Cancellation ', '9FCB9B61-2905-4868-9793-695B46B2EA8B': '[Complaints] Contact Customer', 'FFCD524C-F01C-4BA9-B3EC-66A433C6ACAD': 'Missing Benefits Main Flow', 'B5979859-9047-438B-98FF-CF180D29B95F': 'AST Incorrect Rate Investigation - Voucher Bug', '9402FECD-8A9C-473A-92F8-387791215618': 'Update UPC SF', '1C2C26AC-E67C-41D1-93D3-927FE9F92426': '[Complaint] Contact B.com', '5A8E61FF-1339-4F48-A435-9C3DB268C7AC': 'Ask for help landing page', 'CEBD6E64-34FF-48B3-9AD4-37A7D49E10B1': 'Palm Sub Flow', '82B15B9C-8F98-4EC8-BE89-0F43C23B377E': 'Amend POS collect CC', 'CD62C2D8-5E68-4754-8112-646F16D7AC89': 'Amend POS Contact superAgg Non-Bcom', '91BA7437-0536-4749-851E-DCFD49A1D52C': 'PropertyPageAMABotFlow', 'D443592B-D189-4E10-97E3-FADB3E99ADF0': '[AST] [V-IVR] Content and Front End', 'E074D2B4-601A-4424-9AA8-924A82E7821C': 'Reservation Not Found - Contact Property', '974D3C4D-B3FB-4C75-A83E-553BCB4A9B50': 'ZZZ ARCHIVE Visual IVR Rating', 'DBD93227-AC63-403D-A671-7EC83485E831': 'Inquiry Flow - Payment Escalation', 'A15CA682-9257-480F-9B06-BEC76A6B960D': 'Amend POS Get Deadline', '4A8D3398-4E44-4288-9E5D-7E44FA396084': 'UPC SF', '608F07A8-C056-413E-AE82-3BE76D279965': '[Complaints] Main Flow', 'E3A3E0DC-8B9B-45C9-A743-DE0A40910092': 'Adjust Payments', '032660A3-737F-405C-8D78-0C3676D0BC61': 'Adjust Charges', 'ABA708F8-8EC3-43DD-979C-9B1290786E05': '[AR] Amend Room Type', 'B64CF859-6AC6-4FC6-9408-7A679DBB5C26': 'Visual IVR Property related questions', '9547BA00-9146-4CEC-AD81-4188BF11C70F': 'Cancellation Contact Superagg Non-Bcom', 'EBA2CED7-856F-4446-A32E-C05277125591': 'eCard SF', '168FF1E5-44C0-47A2-AEFE-BF9A5985B816': 'Cancellation Duplicate Email', '0BAD7FA3-0528-4E22-B4CA-887BE7CD5617': 'New Flow 2', '929975B4-0C0F-4407-8167-586C1BE8C41B': 'Cancellation KRCNBR Waiver Scenarios', 'A7D75189-DB3D-4A83-969F-834A0121B008': '[AST] Cannot Charge Telex transfer Bank Account Setup SF', '1E81C9E3-A41A-47D1-8395-EE476B5ED78C': 'Flights ASC Check', '2CBB3B33-5DB2-43C1-A9D3-19E30FF85717': '[AR] Reason-Outcome Tracking', 'E0ED0EEC-2A2F-40A3-B20D-4C728903DEA5': 'Cancellation Get Documents', '4591D225-DC57-45FE-A08C-EC71D323EA16': 'Foremost VIVR', '97CE5EEA-F3C4-43E2-8AC7-CEC3FD7EEEF3': 'UPC Verify UPC details SF', 'CAE459EB-9E39-4EC0-AC24-86A1251F2D5D': 'Amend RT Confirm Amendment', 'BAFFBF46-B2F9-4075-B95C-E5C8B8EA30D7': 'Amend POS mini check allotment', '03DDF9E8-760E-4EE4-9FE2-224790AC8F80': 'Manage Credit Card', '9C6C4ABC-C676-4398-AA37-25EB655FF735': 'Wizard Hello World', '70B11A29-29C2-4866-9E60-8430903F9C01': 'Send CSI Closing Summary', '816B8FE9-AFEF-4D4F-BE9F-EA76942CF480': 'Visual IVR Intro Subflow', 'C238BB6F-2594-432D-839D-20643D3B0F9E': 'Inquiry Flow - Bcom fee waiver request', '07A315B0-44B8-45E8-BC2D-DCCBC38AA8AE': 'Flights Exceptional Case Submission', '0E418BE6-CEDB-47BE-8C82-75F75C4E6284': 'Contact Back', '741DCABA-8642-4B27-9A40-63A877289E13': 'Amend POS BCOM', '8FD62DE3-B3DC-4E19-B32C-4E5E36696FF3': 'Visual IVR e-receipt', '0D8B998C-4232-40CF-9A03-94308AC866D1': 'Cancellation Get GOG Approval', 'AF30541C-D44F-41DD-AA98-19D9323F1CCC': 'Flight Supplier Adjustment', 'F1EFB469-2392-4131-AF83-4BBC017BB036': 'VIVR Main Menu', '2B53F22B-80DD-459E-BE27-76EA3C6D8064': 'Reservation Not Found - Cxl due to AA', '4CDDE4B8-852D-42EA-821B-DE9EB1F9A106': 'Visual IVR Payment Info', '77AD655F-2E1A-492B-9E23-B9FA4E1D0524': 'Flights VIVR Cancellation', '7FA3EE41-3BDB-47F3-B661-F694B3FE84D7': 'Password Reset Main Flow', 'C5CCFA59-7961-4D17-B4B3-EB993C50A8BA': 'Flight Post Booking Fee', 'CD452BF4-C5E2-4F33-9ACB-945FB8009DBE': '[AST][V-IVR] Programs and discounts', '66A4F59E-1ABB-4A52-9FCB-8417B60021BE': '[AST] Aged Booking Inquiry', 'BD2389DE-9E3A-4CB9-BA5B-8B56048750F3': "Varun's Hello World", 'B563A3AC-AD2F-4C69-80C8-06C38D55804D': 'Mini Amend Dates', 'F9D596AA-72BC-4982-A69C-D24E6ECB4C8C': '[SF] Flights Offline Tracking', 'F27757DE-E22D-4058-B5EC-C6FCCF204845': 'Visual IVR Refund Status', 'B4ED3570-9394-46CB-855D-A0ADCA705C8D': 'AST Incorrect Rate Investigation - Hub', '95EE553C-638B-4085-B960-90C3A0339EA8': 'Flights VIVR Change Flight', 'D5CB17FF-07F8-40A9-A869-28508578674C': 'Cancellation Waiver Approved', 'D14E90DA-7818-4A41-A182-20886F382284': 'AST AFH Landing Page', '4D447AA8-B59C-4500-96B5-EB0C78747F55': 'AST Approvals SF', '52F43429-CA2C-4E7B-A617-F7DC6B8DE004': 'Visual IVR Rating', '71E7732F-7BB5-4A02-BA93-717611F2212C': 'Inquiry Flow - Main Flow', '36BBEA74-AE6F-4F70-9120-D2E99479E803': 'AST Incorrect Rate Investigation - Rate Calculation', '24238595-9C94-4E7E-BC69-9EC9CAB63E50': 'Flights Insurance Main Flow', '9F17E035-6389-45A2-B6DB-4D2546E14FCA': 'rawn-vivr-flow', '9D9D5182-9F4E-46B5-BE12-7DEE3AA75CBC': 'Trilochan wizard', '40BA6BA8-2CAD-4403-8E01-51D8102D4F70': 'Translated Payment Methods SF', '17702609-44B4-4A81-9B49-C468F36503D1': 'C2EM Canned responses', '6B6AD676-AE89-4268-BE51-31708E2CFDC3': 'Common Send Email', 'C854428A-AF57-47E8-8672-E4A04C9B9414': 'Amend RT SmartSearch', '96D7F0BC-3C57-4416-B91F-2D2B716EDFFA': '[Complaints] Compensation', 'A1D75FD2-953F-446F-B5E0-D76C75E7A381': 'Amend POS contact property', '67D912E7-90C6-4652-A7ED-5621B5ED7513': 'Amend Name Main Flow', '1CECE838-23BD-437D-B5BD-4CF2B39308DE': 'Flights Insurance Cancellation', '713F9AB9-418C-426D-B31E-C8DB6744E03F': 'Unable to charge UPC', '624B039F-9B18-417E-901E-5A39DDB5D766': 'Cancellation Get Deadline', '75354043-394E-46FE-93A1-393450BADC40': 'Flights V-IVR Booking Details', 'B49DBD1D-51A2-4CA4-BFDA-EC075E1903C7': 'Flights Cancellation Split Check', '6959D565-2C50-4591-85BC-97866B25B8F5': 'Jack v3', 'DDB58C7D-EFC9-4309-AF8E-0CB5F1606C74': 'learnFlow', 'D20CE328-BAB5-4248-90AC-209F68E1E167': 'Flights Supplier Detail Table', 'B0DBCFBF-F246-409B-918D-D5028C5DD16A': 'Flight Cancellation', '44C9D1CC-8904-47E4-9CCE-0622FEC690F6': 'Mock AST Hotel Closure', 'D526F751-73DC-4A6D-8339-7521A9862DCA': 'Flights Booking Info Main Flow', 'C2FAC542-E724-40B6-8B9D-B28E1D485273': 'Foremost 3', '9EDD09BA-E975-4EA3-BBFF-8FFC128E8A23': 'Amend RT None of these ', '50F79314-211D-4A6C-BCBB-C39697E9D8CE': 'AST Resume Ticket Validation', '099B7D28-BF31-48EE-90D9-73D1F3334F31': 'Flights Unconfirmed Booking', '2795FBE0-ECD9-4C2E-9836-5AC39B5751CB': 'Loss Tracker SF', '21235DEF-D9FA-4A6E-84B9-12094CDE3C24': 'UPC Payment Status SF', 'CA33540C-1DA3-4BE7-9502-D4B3415D83EA': 'Booking Detail', 'C60D1898-B844-4AC4-93ED-5178E3B8E77A': 'Flights VIVR Baggage Info', '0B3C8718-6DDF-453B-A29C-A40043A2D44B': 'Visual-IVR Amend Name', 'DD9BB8CA-1C7F-46C8-ADD9-460DD1B216BD': 'Flight Reject Booking', '2A4532EE-6B33-463C-8CA8-056EFEA4FDFF': 'Urgency Criteria Calculon', '25F914A3-AA69-47A4-9230-EFEB9EDBAE73': '[Unused] Flights Cancellation Void Policy Check', '3AF657C3-2199-4DC4-838B-E043A3A4BEDF': 'Flights Cancellation Void get quote inquiry', '3D1F396B-61B5-4484-873A-A2EA8A443029': 'AST Incorrect Rate Absorption', 'A35DE48E-109F-4D89-9CC7-C75B99CCEDA3': 'Visual IVR AgodaCash', '15513C04-E41E-419B-AF19-0B90F66D06E5': 'Visual IVR Date Change', 'D9EBF336-CD2E-467B-822F-C6006C8E1492': 'Visual IVR Travel info', '0D293158-D2FF-427C-BC6F-A99E240EE57D': 'Flight TTA', '6E7D9190-D442-49A1-BC45-B2A578FE48C4': 'Tech - bkg escalation', 'B06A17F8-4698-478F-9090-D4FD63CFA3E0': 'CST Mini Actions - Adjust CXL Fee', '3F40D01E-86DC-45E3-BFC9-2E0DFA38FA3D': 'YCS Consultation Flow', 'B9CD865B-665B-46AB-87A2-878DB473F98D': 'Cancellation Bcom SSFW and Grace', '0928C965-EA37-4FB2-BD33-8D6B58325DF3': 'Delete Credit Card', 'EDAAB569-A287-4C56-BA19-6F8578F4C7D1': 'Amend POS not allowed options', 'C0723DC9-8750-40C1-9E65-86D54CD09C4C': "Trilochan's page", 'D8BCA43B-9644-4889-8B55-D4597F0D823C': "Dima sandbox'=", '93ADA791-C955-494F-A15A-FA6FBA623A1D': 'Flight Void', 'D146A5BE-C95A-463B-AE18-4EA5E1FC234E': 'CST Mini Actions Flow', 'BCE1D736-ADF2-4DBE-AFE2-7937530F81C1': '[AR] Main Flow', '78CA8A81-BCD0-46A1-9D82-C6C52AD532DD': 'Tech - Flights - E levy', 'AE7113D5-79BE-48C2-9E6B-8B6F32D5274A': 'TC feedback tool', '7DA136E5-6F2A-4E27-BA0D-9509BC9185E2': '[CBDS] Main flow', '872368C8-BB59-40FA-B487-F51C63CC36D4': 'Campaign Detail Table', '081CC596-9504-4E25-88D7-55030DA13F18': 'Cancellation Send Email', '450B8FC9-1F3B-4085-8CE9-63DCE9F746D2': 'Workflow table deployment pipeline', 'C4D1F98A-9CD8-4E8F-A2BF-2C23A87E13BE': 'Amend POS property decision', '76C76F66-EC20-4DC0-96AB-0148986278B1': 'AST Incorrect Rate Main Flow', '4FE0955C-6968-467E-977E-C17FE086F101': 'Flights Cancellation Void cxl req', '62F47ECB-766C-4D02-A06E-9D33B383625E': 'Inquiry Flow - Refund Investigation - Pay to Agoda', '66BC9A01-A22D-43D0-8583-AA04429083BE': '[AR] Contact B.com', '1665E73C-9E0D-4C3E-A8C2-DD226DDE4382': 'AAB process', 'B541956F-6B7D-4EC2-B9C8-1C78047AF8F6': 'Flights Rejected Technical Error', '44B415E4-42F0-4D43-885D-CA8067C8CF8B': 'Visual IVR Hotel Policy', '81FBF9B2-C090-4073-B0A2-D52121F541C5': 'delete me', 'DE46F7BC-52AA-4E6B-A7CE-CE8AF264C64E': 'Amend POS HTB', '5ED6A501-869B-4510-A39A-D9F9FFB21F6F': 'Allen Garbage Flow (Do not Touch)', '7E334ACE-8F92-4EAE-B496-1E2EBCC66145': '[QS] Report No-show', '40D062B6-BACA-4F1D-A066-3680B5735882': 'Cancellation SSFW', '6A757C61-7311-4149-874E-9CA9B0279F10': 'Inquiry Flow - Supplier Decision', 'E82E4E9D-D4A2-410C-AF60-17A37C2BD2C5': 'Flights Get TTA Status', 'D2FADDC9-D298-478F-864A-4BB09F30F257': 'R U SST', 'CFE9546D-6B8D-416F-BE4B-1B93030B6A02': 'Inquiry Flow - Refund Investigation - Refund by Property', '6A491951-C48D-4689-AA13-3604B981F079': 'Flights Cancellation Refund Fail', '2B95304E-C411-4BFE-94F8-042DDE04965C': 'Flights VIVR Main Flow Intents', 'A390AB96-0375-4A00-A85C-FFE185CE8708': 'Amend POS allow options', 'BAA582C2-1781-4724-A1CC-5EB92249EB85': 'Flights Cancellation Calculator', 'D4273911-3B36-4039-BB3E-28F7C8BD309A': 'Flights Cancellation Partial and Noshow Check', '19B05757-4D11-4C4A-A7C9-0162B1F21596': 'Reservation Not Found - Contact Customer', '02E4F929-9CA2-4ED4-AD83-2F699A428228': 'AST AFH Feedback Form', '011B5E57-1ECC-4C0E-AC60-2AE54B01FB55': 'Cancellation Partial Waiver', '5F2D0F30-57B1-4800-8933-DC90C9B7457D': 'CSI Tracking Flow', '453F2E2F-7926-4085-A4CC-3612E9B51370': 'Amend RT Main Flow', 'F354E2BD-A0BB-4333-BDF2-597B641EC49D': 'UPC on EPass SF', '0191A58A-1852-4252-9087-2904F75B54EC': 'Flights Cancellation Quote', 'ADA7BF0F-83A9-4521-87DE-C9A6A5EFF82F': 'Reservation Not Found - Contact Bcom Urgent' }
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
					sfId = transition.subflow
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

if (false && document.location.href == 'https://qa-wizard-designer.agoda.local/') {
	var styles = `
        .intro,
        .intro a{
          color:#fff;
          font-family:
        }
        /* customizable snowflake styling */
        .snowflake {
          color: #fff;
          font-size: 1em;
          font-family: Arial;
          text-shadow: 0 0 1px #000;
        }
        
        @-webkit-keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@-webkit-keyframes snowflakes-shake{0%{-webkit-transform:translateX(0px);transform:translateX(0px)}50%{-webkit-transform:translateX(80px);transform:translateX(80px)}100%{-webkit-transform:translateX(0px);transform:translateX(0px)}}@keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}@keyframes snowflakes-shake{0%{transform:translateX(0px)}50%{transform:translateX(80px)}100%{transform:translateX(0px)}}.snowflake{position:fixed;top:-10%;z-index:9999;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;-webkit-animation-name:snowflakes-fall,snowflakes-shake;-webkit-animation-duration:10s,3s;-webkit-animation-timing-function:linear,ease-in-out;-webkit-animation-iteration-count:infinite,infinite;-webkit-animation-play-state:running,running;animation-name:snowflakes-fall,snowflakes-shake;animation-duration:10s,3s;animation-timing-function:linear,ease-in-out;animation-iteration-count:infinite,infinite;animation-play-state:running,running}.snowflake:nth-of-type(0){left:1%;-webkit-animation-delay:0s,0s;animation-delay:0s,0s}.snowflake:nth-of-type(1){left:10%;-webkit-animation-delay:1s,1s;animation-delay:1s,1s}.snowflake:nth-of-type(2){left:20%;-webkit-animation-delay:6s,.5s;animation-delay:6s,.5s}.snowflake:nth-of-type(3){left:30%;-webkit-animation-delay:4s,2s;animation-delay:4s,2s}.snowflake:nth-of-type(4){left:40%;-webkit-animation-delay:2s,2s;animation-delay:2s,2s}.snowflake:nth-of-type(5){left:50%;-webkit-animation-delay:8s,3s;animation-delay:8s,3s}.snowflake:nth-of-type(6){left:60%;-webkit-animation-delay:6s,2s;animation-delay:6s,2s}.snowflake:nth-of-type(7){left:70%;-webkit-animation-delay:2.5s,1s;animation-delay:2.5s,1s}.snowflake:nth-of-type(8){left:80%;-webkit-animation-delay:1s,0s;animation-delay:1s,0s}.snowflake:nth-of-type(9){left:90%;-webkit-animation-delay:3s,1.5s;animation-delay:3s,1.5s}
        /* Demo Purpose Only*/
        .demo {
          font-family: 'Raleway', sans-serif;
        	color:#fff;
            display: block;
            margin: 0 auto;
            padding: 15px 0;
            text-align: center;
        }
        .demo a{
          font-family: 'Raleway', sans-serif;
        color: #000;		
        }
`

	var styleSheet = document.createElement("style")
	styleSheet.innerText = styles
	document.head.appendChild(styleSheet)

	var snowFlakeDiv = document.createElement("div")
	snowFlakeDiv.classList.add("snowflakes");
	snowFlakeDiv.setAttribute("aria-hidden", "true")
	//<div class="snowflakes" aria-hidden="true">
	const snowHTML = `
      <div class="snowflake">❅</div><div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❄</div><div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❄</div><div class="snowflake">❅</div><div class="snowflake">❆</div><div class="snowflake">❄</div></div>
    `
	snowFlakeDiv.innerHTML = snowHTML
	document.body.appendChild(snowFlakeDiv)
}


const selectedFlow = window.localStorage.selectedFlow
if (document.location.href == 'https://qa-wizard-designer.agoda.local/' && !!selectedFlow && selectedFlow != '') {
	function waitForElement(selector, callback) {
		const searchBox = document.querySelector('.global-search-input');
		if (searchBox) {
			console.log('test');
			callback(searchBox, selectedFlow);
		} else {
			setTimeout(() => {
				waitForElement(selector, callback);
			}, 100);
		}
	}

	function changeInputValue(elm, value) {
		const lastValue = elm.value;
		elm.value = value;
		const event = new Event('input', { bubbles: true });
		event.simulated = true;
		const tracker = elm._valueTracker;
		if (tracker) {
			tracker.setValue(lastValue);
		}
		elm.dispatchEvent(event);
	}

	waitForElement('.global-search-input', function simulateTyping(inputField, text, index = 0) {
		if (index >= text.length) {
			return;
		}
		changeInputValue(inputField, text.substring(0, index + 1));
		setTimeout(() => {
			simulateTyping(inputField, text, index + 1);
		}, 5); // delay between keystrokes, you might need to adjust this value based on your debounce timing
	});
}