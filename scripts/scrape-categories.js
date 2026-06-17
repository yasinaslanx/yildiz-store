const https = require('https');
const fs = require('fs');

https.get('https://sunix.com.tr/', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        // Find category items. It looks like they are inside some container
        // Actually, we can just grab all <img> tags and log them
        const matches = [...data.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
        matches.forEach(m => {
            console.log(m[0]);
        });
    });
});
