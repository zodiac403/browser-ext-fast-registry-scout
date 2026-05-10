const FETCH_TIMEOUT_MS = 3000;
const HTTP_STATUS_OK = 200;

const registryConfig = {
    npm: {
        searchUrl:  "https://www.npmjs.com/search?q=",
        lookupUrl:  "https://registry.npmjs.org/",
        packageUrl: "https://www.npmjs.com/package/",
    },
    pypi: {
        searchUrl:    "https://pypi.org/search/?q=",
        lookupUrl:    "https://pypi.org/pypi/",
        lookupSuffix: "/json",
        packageUrl:   "https://pypi.org/project/",
    },
    docker: {
        searchUrl:  "https://hub.docker.com/search?q=",
        // LookupUrl:  "https://hub.docker.com/v2/repositories/library/",
        // PackageUrl: "https://hub.docker.com/_/",
    },
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

const handleRegistryClick = async (registryKey, button) => {
    const name = document.getElementById("package").value.trim();
    const config = registryConfig[registryKey];

    if (!name) {
        showMessage("Please enter a package name.");
        return;
    }

    if (!config.lookupUrl) {
        window.open(config.searchUrl + name, '_blank', 'noopener,noreferrer');
        return;
    }

    button.disabled = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
        const response = await fetch(
            config.lookupUrl + name + (config.lookupSuffix ?? ''),
            { signal: controller.signal },
        );
        if (response.status === HTTP_STATUS_OK) {
            window.open(config.packageUrl + name, '_blank', 'noopener,noreferrer');
        } else {
            window.open(config.searchUrl + name, '_blank', 'noopener,noreferrer');
        }
    } catch {
        window.open(config.searchUrl + name, '_blank', 'noopener,noreferrer');
    } finally {
        clearTimeout(timeoutId);
        button.disabled = false;
    }
};

// Configure event listeners
document.addEventListener("DOMContentLoaded", () => {
    Object.keys(registryConfig).forEach(registryKey => {
        const button = document.getElementById(registryKey);
        button.addEventListener("click", () => {
            handleRegistryClick(registryKey, button);
        });
    });
    document.getElementById("package").addEventListener("click", () => {
        showMessage();
    });
    document.getElementById("disclaimerButton").addEventListener("click", () => {
        document.getElementById("disclaimerText").classList.add("visible");
    });
    document.getElementById("disclaimerButton").addEventListener("mouseleave", () => {
        document.getElementById("disclaimerText").classList.remove("visible");
    });
});
