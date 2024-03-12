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

// Set function that runs every 500ms to check for a change in pages
let currentPage = location.href;
setInterval(function()
{
	if (currentPage != location.href) { // page changed
		currentPage = location.href;
		// update tab name (only needed for debug pages now)
		if (currentPage.match(".*agoda.*\/wizard\/debug.*")) {
			updateTabName();
		}
		if(currentPage.includes('node')||currentPage.includes('transition')) {
			// auto-refresh page if its in the node editor or transition editor (changes only get applied after a refresh)
			location.reload();
		}
	}
}, 500);


// Fast save code below
// First check if we are on the node editor page, for performance reasons because we set a mutation observer
if(currentPage.includes('node')) {
	try {
		// Add alt+s keyboard shortcut for saving
		const saveChangesButton = document.querySelectorAll('button[data-testid="header-save-button"]')[0];
		document.addEventListener('keyup', function(event) {
		    if (event.key == 's' && event.altKey) {
			saveChangesButton.click();
		    }
		});
	} catch {
		console.log('modify save change shortcut error');
	}


	//add shortcut to comment shortcut to code mirror and set default value to return continue if empty 
	try {
		let cmInstance = document.querySelectorAll('.CodeMirror')[1].CodeMirror
		console.log("cmInstance")
		console.log(cmInstance)

		if (cmInstance.getValue() === '') {
			cmInstance.setValue("return 'continue';");
		}

		cmInstance.setOption("extraKeys", {
			"Ctrl-/": "toggleComment",
			"Cmd-/": "toggleComment"
		});
	} catch {
		console.log('modify codemirror error');
	}

	
}

// Code to clean up debugger pages
if (currentPage.match(".*agoda.*\/wizard\/debug.*")) { // debugger pages
	// Make element transitions in debugger vertical and wider
	if (document.getElementById("debuggerviewcontainer")) {
		let transitionsElementIndex = 3;
		if(document.location.host.match(".*visual-ivr.*")) transitionsElementIndex = 2;
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
}

// Code to clean up edit flow overview page (where it shows all the elements)
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
			ele.setAttribute("style", "overflow-y: visible; border-bottom: 1px solid black");
		};
	} catch (e) {
		console.log('removing searchbar or remove element scroll or debugger vertical element error\n' + e)
	}
	try {
		const url = "https://icanhazdadjoke.com";
		let djString = "No joke today :(";
		
		const myHeaders = new Headers();
		myHeaders.append("Accept", "text/plain");
		const options = {
			method: "GET",
			headers: myHeaders
		};
		
		fetch(url,options).then((res) => res.text()).then((result) => {
			djString = result
			console.log(djString);
			const a = new Date();
			var datestring = a.getFullYear() + "-" + ("0" + (a.getMonth() + 1)).slice(-2) + "-" + ("0" + a.getDate()).slice(-2);
			if (!!window.localStorage["tdDJ"]) {
			  const tdDJ = JSON.parse(window.localStorage["tdDJ"]);
			  if (tdDJ.date != datestring || true) {
			    const DJ = djString
			    const tdDJ = {
			      date: datestring,
			      text: DJ,
			    };
			    window.localStorage["tdDJ"] = JSON.stringify(tdDJ);
			  }
			} else {
			  const DJ = djString;
			  const tdDJ = {
			    date: datestring,
			    text: DJ,
			  };
			  window.localStorage["tdDJ"] = JSON.stringify(tdDJ);
			}
			
			const DJ = JSON.parse(window.localStorage["tdDJ"]).text;
			
			let placeholder = document.querySelector("#dj");
			if (!!!placeholder) {
			  const crumb = document.querySelector(".crumb-wrapper");
			  placeholder = document.createElement("div");
			  placeholder.id = "dj";
			  placeholder.innerHTML = `<p>${DJ}</p>`;
			  placeholder.className = "Box-sc-kv6pi1-0 BLtGt";
			  crumb.after(placeholder);
			}
			placeholder.innerHTML = `<p>${DJ}</p>`;
		});
	} catch (e) {
		console.log(e);
	}
}

if (document.location.href == "https://qa-wizard-designer.agoda.local/deploy") {
	// Select the node that will be observed for mutations (in this case, the body)
	var targetNode = document.querySelector("body");

	// Options for the observer (which mutations to observe)
	var observerConfig = { childList: true, subtree: true };

	// Create an observer instance linked to the callback function
	var observer = new MutationObserver(function (mutationsList, observer) {
		for (let mutation of mutationsList) {
			// Look through all nodes being added to the document
			for (let node of mutation.addedNodes) {
				if (node.id == "workflowFileContainer") {
					var inputfile = document.querySelector("input[type=file]");
					var tableContainer = document.querySelector(".tableContainer");

					if (!tableContainer) {
						tableContainer = document.createElement("div");
						tableContainer.classList.add("tableContainer");
						// Set the fixed width and height
						tableContainer.style.width = "100%";
						tableContainer.style.height = "500px";
						document.querySelector(".deployform").appendChild(tableContainer);
					}

					function handleFileLoad(event) {
						const fileList = this.files;
						const reader = new FileReader();

						reader.onload = function (e) {
							// Clear the existing table from the container
							tableContainer.innerHTML = "";

							var new_div = document.createElement("div");
							var table_preview = document.createElement("div");

							new_div.className = "csv-table";
							new_div.style.maxHeight = "75%";
							new_div.style.overflow = "auto";
							new_div.style.width = "75%";
							new_div.style.boxShadow = "0px 4px 8px 0px rgba(0,0,0,0.2)";
							new_div.style.display = "block";

							table_preview.textContent = "Table Preview";
							table_preview.style.fontWeight = "bold";
							table_preview.style.fontSize = "14px";
							table_preview.style.padding = "12px 0px";

							const table_html = csv_string_to_table(e.target.result, new_div);
							tableContainer.appendChild(table_preview);
							tableContainer.appendChild(new_div);
						};
						reader.readAsText(fileList[0]);
					}
					inputfile.addEventListener("change", handleFileLoad);

					function csv_string_to_table(csv_string, element_to_insert_table) {
						var rows = csv_string.trim().split(/\r?\n|\r/);
						//var comma_regex = /(,)(?=(?:[^"]*"[^"]*")*[^"]*$)/g; // Split by commas not inside quotes
						var comma_regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/g; // Split by commas not inside quotes

						var tableStyle =
							'style="border-collapse:collapse;width:100%;table-layout:auto;"';
						var thStyle =
							'style="border:1px solid black;padding:10px;text-align:left;background-color:#18499A;color:white;width:auto;overflow:hidden;text-overflow:ellipsis;"';
						var tdStyle =
							'style="border:1px solid black;padding:10px;text-align:left;width:auto;overflow:hidden;text-overflow:ellipsis;"';

						var table = "";
						var table_rows = "";
						var table_header = "";

						rows.forEach(function (row, row_index) {
							var table_columns = "";
							var columns = row.split(comma_regex); // Split by regex
							columns.forEach(function (column, column_index) {
								var clean_column = column.replaceAll('"', ""); // Removes extra quotes
								//if (clean_column != ",") {
								table_columns +=
									row_index == 0
										? "<th " + thStyle + ">" + clean_column + "</th>"
										: "<td " + tdStyle + ">" + clean_column + "</td>";
								// }
							});
							if (row_index == 0) {
								table_header += "<tr>" + table_columns + "</tr>";
							} else {
								table_rows += "<tr>" + table_columns + "</tr>";
							}
						});

						table += "<table " + tableStyle + ">";
						table += "<thead>";
						table += table_header;
						table += "</thead>";
						table += "<tbody>";
						table += table_rows;
						table += "</tbody>";
						table += "</table>";

						element_to_insert_table.innerHTML = table;
					}
					observer.disconnect(); // Stop observing for mutations once we found our element
				}
			}
		}
	});

	// Start observing the target node for configured mutations
	observer.observe(targetNode, observerConfig);

	try {
		document.querySelector('.deploytitle').style = 'margin: 60px 5px 0px 0px !important;'
		document.querySelector('.parent').style = 'width:90% !important;left:16% !important;'
		document.querySelector('.deployFooter').style = 'height:60px !important; bottom: 0px; position: fixed; top: auto;'
	} catch (e) { 
		console.log(e)
	}
}
