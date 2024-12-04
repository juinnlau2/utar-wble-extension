console.log("Content script loaded.");

// Function to extract PDF links
function extractPdfLinks() {
    const links = document.querySelectorAll('li.activity.resource a[href*="view.php?id="]');
    console.log(`Found ${links.length} links.`);
    return Array.from(links).map(link => link.href);
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getPdfLinks") {
        const pdfLinks = extractPdfLinks();
        sendResponse({ pdfLinks });
    }
});
