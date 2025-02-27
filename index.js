const registryConfig = {
    docker: "https://hub.docker.com/search?q=",
    npm: "https://www.npmjs.com/search?q=",
    pypi: "https://pypi.org/search/?q=",
};

// Common function for handling search
const searchPackage = (registryKey) => {
    const packageName = document.getElementById("package").value.trim();

    if (!packageName) {
        alert("Please enter a package name.");
        return;
    }

    const packageUrlTemplate = registryConfig[registryKey];
    const packageUrl = `${packageUrlTemplate}${packageName}`;

    if (chrome && chrome.tabs) {
        chrome.tabs.create({ url: packageUrl });
    }
    else {
        alert(`Unknown browser: ${{ chrome }}, ${{ tabs: chrome.tabs }}`)
    }
}

// Configure event listeners
document.addEventListener("DOMContentLoaded", () => {
    Object.keys(registryConfig).forEach(registryKey => {
        document.getElementById(registryKey).addEventListener("click", () => {
            searchPackage(registryKey);
        });
    })
});
