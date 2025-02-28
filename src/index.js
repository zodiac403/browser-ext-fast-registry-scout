const registryConfig = {
    docker: "https://hub.docker.com/search?q=",
    npm: "https://www.npmjs.com/search?q=",
    pypi: "https://pypi.org/search/?q=",
};

const showMessage = (text) => {
    const element = document.getElementById("message");

    if (text) {
        element.style.display = "block";
        element.innerText = text;
    } else {
        element.style.display = "none";
        element.innerText = "";
    }
}

// Common function for handling search
const searchPackage = (registryKey) => {
    const packageName = document.getElementById("package").value.trim();

    if (!packageName) {
        showMessage("Please enter a package name.");
        return;
    }

    const urlTemplate = registryConfig[registryKey];
    const packageUrl = `${urlTemplate}${packageName}`;

    window.open(packageUrl, '_blank');
}

const toggleDisclaimer = (show) => {
    const element = document.getElementById("disclaimerText");

    if (show) {
        element.style.display = "block";
    }
    else {
        element.style.display = "none";
    }
}

// Configure event listeners
document.addEventListener("DOMContentLoaded", () => {
    Object.keys(registryConfig).forEach(registryKey => {
        document.getElementById(registryKey).addEventListener("click", () => {
            searchPackage(registryKey);
        });
    });
    document.getElementById("package").addEventListener("click", () => {
        showMessage();
    });
    document.getElementById("disclaimerButton").addEventListener("click", () => {
        toggleDisclaimer(true);
    });
    document.getElementById("disclaimerButton").addEventListener("mouseleave", () => {
        toggleDisclaimer(false);
    });
});
