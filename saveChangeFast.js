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
