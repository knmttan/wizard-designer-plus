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
