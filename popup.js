console.log("popup.js loaded");

// Function to resolve the actual PDF URL after a redirect
async function getRealPdfUrl(redirectUrl) {
    console.log(`Resolving PDF URL: ${redirectUrl}`);
    try {
        const response = await fetch(redirectUrl, {
            method: "GET",
            redirect: "follow", // Automatically follow redirects
        });

        console.log(`Resolved URL: ${response.url}`);
        if (response.ok && /\.(pdf|pptx|docx)$/i.test(response.url)) {
            return response.url; // Return the actual PDF URL
        } else {
            console.warn(`No valid PDF found at: ${response.url}`);
            return null;
        }
    } catch (error) {
        console.error(`Error resolving PDF URL for ${redirectUrl}:`, error);
        return null;
    }
}

// Function to download the PDF file
function downloadPdf(pdfUrl, filename) {
    console.log(`Downloading PDF: ${filename} from ${pdfUrl}`);
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = filename;
    a.click();
}

// Function to handle the "Download All PDFs" button click
document.getElementById("downloadBtn").addEventListener("click", async () => {
    console.log("Download button clicked");

    try {
        const pdfLinks = await new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length === 0) {
                    reject("No active tab found.");
                    return;
                }

                chrome.tabs.sendMessage(
                    tabs[0].id,
                    { action: "getPdfLinks" },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError.message);
                        } else if (response && response.pdfLinks) {
                            resolve(response.pdfLinks);
                        } else {
                            reject("No response or PDF links found.");
                        }
                    }
                );
            });
        });

        console.log(`Found ${pdfLinks.length} PDF links:`, pdfLinks);

        // Resolve and download each PDF
        for (let i = 0; i < pdfLinks.length; i++) {
            console.log(`Processing link ${i + 1}: ${pdfLinks[i]}`);
            const realPdfUrl = await getRealPdfUrl(pdfLinks[i]);

            if (realPdfUrl) {
                const filename = `module-${i + 1}.pdf`;
                downloadPdf(realPdfUrl, filename);
            } else {
                console.warn(`Failed to resolve PDF for link ${pdfLinks[i]}`);
            }
        }
    } catch (error) {
        console.error("Error fetching or downloading PDF links:", error);
    }
});
