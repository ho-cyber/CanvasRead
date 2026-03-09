async function test() {
    const payload = {
        model: "nvidia/llama-3.2-nv-vision-11b-instruct",
        messages: [
            {
                role: "user",
                content: "What is in this image? <img src=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=\" />"
            }
        ],
        max_tokens: 50,
        temperature: 0.60
    };

    console.log("Sending...");
    try {
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error("ERROR TEXT:", await response.text());
        } else {
            console.log(await response.json());
        }
    } catch(e) {
        console.error(e);
    }
}

test();
