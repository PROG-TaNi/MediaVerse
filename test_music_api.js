const fetch = require('node-fetch');

async function testMusicAPI() {
  try {
    console.log('Testing Music API...\n');
    
    // Test basic music endpoint
    console.log('1. Testing /api/music endpoint...');
    const response = await fetch('http://localhost:5000/api/music?limit=5');
    const data = await response.json();
    
    console.log(`✅ Response status: ${response.status}`);
    console.log(`✅ Music count: ${data.music ? data.music.length : 'No music array'}`);
    
    if (data.music && data.music.length > 0) {
      console.log('\n📝 Sample music tracks:');
      data.music.slice(0, 3).forEach((track, index) => {
        console.log(`${index + 1}. "${track.title}" by ${track.authors.join(', ')}`);
        console.log(`   Album: ${track.metadata?.album || 'Unknown'}`);
        console.log(`   Genre: ${track.genres.join(', ')}`);
        console.log(`   Rating: ${track.averageRating}/5`);
        console.log('');
      });
    }
    
    // Test artist search
    console.log('2. Testing artist search...');
    const artistResponse = await fetch('http://localhost:5000/api/music/artist/Drake?limit=3');
    const artistData = await artistResponse.json();
    
    console.log(`✅ Artist search status: ${artistResponse.status}`);
    console.log(`✅ Artist songs found: ${artistData.music ? artistData.music.length : 0}`);
    
    if (artistData.music && artistData.music.length > 0) {
      console.log('\n📝 Sample artist songs:');
      artistData.music.slice(0, 2).forEach((track, index) => {
        console.log(`${index + 1}. "${track.title}" by ${track.authors.join(', ')}`);
      });
    }
    
    // Test genres endpoint
    console.log('\n3. Testing genres endpoint...');
    const genresResponse = await fetch('http://localhost:5000/api/music/genres');
    const genresData = await genresResponse.json();
    
    console.log(`✅ Genres status: ${genresResponse.status}`);
    console.log(`✅ Available genres: ${genresData.genres ? genresData.genres.length : 0}`);
    
    if (genresData.genres) {
      console.log(`📝 Sample genres: ${genresData.genres.slice(0, 5).join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing Music API:', error.message);
  }
}

// Run the test
testMusicAPI(); 