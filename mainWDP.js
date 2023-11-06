
let currentPage = location.href;
// listen for changes
setInterval(function()
{
	if (currentPage != location.href)
	{
		// page has changed, set new page as 'current'
		currentPage = location.href;
		if(currentPage.includes('node')) {
			location.reload();
		}
	}
}, 500);

const path = decodeURI(document.location.pathname);
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
} catch{
	console.log("ERROR")
}



//change title to flow name
if (['node', 'transition'].includes(path.split('/')[1])) {
	const title = path.split('/')[2].replace('Cancellation ', '');
	document.title = title
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
if (document.location.host.split('.')[0] == 'qa-wizard-designer') {
	if (document.location.pathname.split('/')[1] == 'integrationPoint') {
		setFavicons('https://cdn-icons-png.flaticon.com/128/9110/9110100.png')
		document.title = 'API builder';
	} else if (document.location.pathname.split('/')[1].includes('deploy')) {
		setFavicons('https://cdn-icons-png.flaticon.com/128/4471/4471714.png')
		document.title = 'Deploy';
	} else {
		setFavicons('https://cdn-icons-png.flaticon.com/128/1680/1680365.png');
	}
} else if (document.location.host.split('.')[0] == 'qa-cegwiz') {
	setFavicons('https://cdn-icons-png.flaticon.com/128/1541/1541402.png');
	let params = new URLSearchParams(location.href);
	document.title = 'Debug ' + params.get('flowName');
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


const elements = document.getElementsByClassName('element-list');
for (var i = 0; elements[i]; i++) {
	const ele = elements[i];
	ele.setAttribute("style", "overflow-y: visible; height: auto; border-bottom: 1px solid black");
};


if (document.getElementById("debuggerviewcontainer")) {
	const ele = document.getElementById("debuggerviewcontainer").children.item(3).getElementsByClassName('content')[0].children.item(0);
	ele.setAttribute("style", "flex-direction: column;");
	const obs = new MutationObserver(function (mutations_list) {
		mutations_list.forEach(function (mutation) {
			mutation.addedNodes.forEach(function (added_node) {
				added_node.children.item(0).setAttribute("style", "height: 100%; width: 90%; padding-bottom: 20px;");
				console.log(added_node);
				if (added_node.class == 'key-container') {
					console.log("hi added node");
					console.log(added_node.parentNode);
				}
			});
		});
	});
	obs.observe(ele, { subtree: false, childList: true });
}
