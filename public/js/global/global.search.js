let searchTimer;
const url = window.location.href;
const session = url.includes("/views/search/user")
    ? "user"
    : url.includes("/views/search/admin")
        ? "admin"
        : undefined;
let user_id = undefined;

//get userId from storage based on the usertype in the url
if (session) {
    user_id = JSON.parse(sessionStorage.getItem(`session-${session}`)) || undefined;
}

const renderSearchResults = (searchResults = []) => {
    const resultsUl = document.getElementById('results-ul');
    resultsUl.innerHTML = "";

    if (searchResults.length === 0) {
        resultsUl.innerHTML = "No results found";
        return;
    }
    searchResults.forEach((result) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <a href="/search/view-item/${session}/${user_id}/${result._id}">
                <div class="thumbnail-wrapper">
                    <img src="${result.type === 'Image File'
                ? result.filePathUrl
                : result.type === 'PDF Document'
                    ? '/files/system/images/pdf.png '
                    : '/files/system/images/word.png'
            }" alt="search result thumbnail">
                </div>
                <div class="title">
                    <p>${result.title}</p>
                    <span>${result.description}</span>
                </div>
            </a>
        `;
        resultsUl.appendChild(listItem)
    });
}

const handleSearch = () => {
    if (!user_id) return;

    const category = document.getElementById("search-category").value;
    const searchInput = document.getElementById("search-input").value;

    if (searchInput == "") return;


    if (category == "none") {
        return Toast_Notification.showInfo("Please Choose a Category");
    }
    const socket = io();

    socket.emit('search', { category, searchInput });
    socket.on('searchResults', (searchResults) => {
        renderSearchResults(searchResults.results.data);
        socket.disconnect();
    });

};
const resetTimer = () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(handleSearch, 500);
};
const handleInputChange = () => {
    resetTimer();
};

document.getElementById("search-input").addEventListener('input', handleInputChange);
document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    handleSearch();
})