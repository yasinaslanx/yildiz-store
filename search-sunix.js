const https = require('https');

async function fetchSearch() {
  const url = 'https://sunix.com.tr/arama?q=S%C3%BCrg%C3%BCl%C3%BC+K%C4%B1l%C4%B1f+Kutusu';
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (data.includes('img') || data.includes('urun')) {
        console.log('Search successful on sunix.com.tr');
        // Simple extraction
        const matches = data.match(/<img[^>]+src="([^">]+)"/g);
        if (matches) {
          console.log(matches.slice(0, 10));
        }
      } else {
        console.log('No data');
      }
    });
  }).on('error', err => console.log('Error: ', err.message));
}

fetchSearch();
