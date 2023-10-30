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
    if (document.location.pathname.split('/')[1] == 'integrationPoint'){
        setFavicons('https://cdn-icons-png.flaticon.com/128/9110/9110100.png')
        document.title = 'API builder';
    } else if (document.location.pathname.split('/')[1].includes('deploy')){
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
