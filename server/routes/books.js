const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const router = express.Router();

// Try to import Content model (optional)
let Content;
try {
  Content = require('../models/Content');
} catch (error) {
  console.log("⚠️  Content model not available, running without database");
}

// Cache for enriched books data
let enrichedBooksCache = [];
let booksLoaded = false;

// Load and enrich books from all CSV files
async function loadEnrichedBooksFromCSV() {
  if (booksLoaded) return enrichedBooksCache;
  
  console.log('📚 Loading and enriching books from Goodbooks-10k dataset...');
  
  try {
    // Load all CSV data
    const books = await loadBooksCSV();
    const bookTags = await loadBookTagsCSV();
    const tags = await loadTagsCSV();
    const ratings = await loadRatingsCSV();
    const toRead = await loadToReadCSV();
    
    // Create tag lookup map
    const tagMap = new Map();
    tags.forEach(tag => tagMap.set(tag.tag_id, tag.tag_name));
    
    // Create book tags lookup map
    const bookTagsMap = new Map();
    bookTags.forEach(bt => {
      if (!bookTagsMap.has(bt.goodreads_book_id)) {
        bookTagsMap.set(bt.goodreads_book_id, []);
      }
      bookTagsMap.get(bt.goodreads_book_id).push({
        tag_id: bt.tag_id,
        tag_name: tagMap.get(bt.tag_id) || 'Unknown',
        count: bt.count
      });
    });
    
    // Create ratings aggregation map
    const ratingsMap = new Map();
    ratings.forEach(rating => {
      if (!ratingsMap.has(rating.book_id)) {
        ratingsMap.set(rating.book_id, { total: 0, count: 0, ratings: [] });
      }
      const bookRating = ratingsMap.get(rating.book_id);
      bookRating.total += rating.rating;
      bookRating.count += 1;
      bookRating.ratings.push(rating.rating);
    });
    
    // Create to-read count map
    const toReadMap = new Map();
    toRead.forEach(tr => {
      toReadMap.set(tr.book_id, (toReadMap.get(tr.book_id) || 0) + 1);
    });
    
    // Enrich books with all data
    const enrichedBooks = books.map(book => {
      const bookTags = bookTagsMap.get(book.goodreads_book_id) || [];
      const bookRatings = ratingsMap.get(book.book_id) || { total: 0, count: 0, ratings: [] };
      const toReadCount = toReadMap.get(book.book_id) || 0;
      
      // Get top tags/genres (sorted by count)
      const topTags = bookTags
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(tag => tag.tag_name);
      
      // Calculate enhanced rating stats
      const enhancedRating = bookRatings.count > 0 
        ? (bookRatings.total / bookRatings.count).toFixed(2)
        : book.average_rating;
      
      return {
        ...book,
        genres: topTags,
        enhanced_rating: parseFloat(enhancedRating),
        enhanced_rating_count: bookRatings.count,
        to_read_count: toReadCount,
        all_tags: bookTags
      };
    });
    
    enrichedBooksCache = enrichedBooks;
    booksLoaded = true;
    console.log(`✅ Loaded and enriched ${enrichedBooks.length} books with genres, ratings, and to-read data`);
    return enrichedBooks;
    
  } catch (error) {
    console.error('❌ Error loading enriched books:', error);
    throw error;
  }
}

// Load books.csv
function loadBooksCSV() {
  return new Promise((resolve, reject) => {
    const books = [];
    const csvPath = path.join(__dirname, '../../goodbooks-10k-master/goodbooks-10k-master/books.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ Books CSV file not found:', csvPath);
      reject(new Error('Books CSV file not found'));
      return;
    }
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          books.push({
            book_id: parseInt(row.book_id),
            goodreads_book_id: parseInt(row.goodreads_book_id),
            best_book_id: parseInt(row.best_book_id),
            work_id: parseInt(row.work_id),
            books_count: parseInt(row.books_count),
            isbn: row.isbn,
            isbn13: row.isbn13,
            authors: row.authors,
            original_publication_year: row.original_publication_year ? parseInt(row.original_publication_year) : null,
            original_title: row.original_title,
            title: row.title,
            language_code: row.language_code,
            average_rating: parseFloat(row.average_rating) || 0,
            ratings_count: parseInt(row.ratings_count) || 0,
            work_ratings_count: parseInt(row.work_ratings_count) || 0,
            work_text_reviews_count: parseInt(row.work_text_reviews_count) || 0,
            ratings_1: parseInt(row.ratings_1) || 0,
            ratings_2: parseInt(row.ratings_2) || 0,
            ratings_3: parseInt(row.ratings_3) || 0,
            ratings_4: parseInt(row.ratings_4) || 0,
            ratings_5: parseInt(row.ratings_5) || 0,
            image_url: row.image_url,
            small_image_url: row.small_image_url
          });
        } catch (error) {
          console.error('Error parsing book row:', error);
        }
      })
      .on('end', () => {
        console.log(`📖 Loaded ${books.length} books from CSV`);
        resolve(books);
      })
      .on('error', reject);
  });
}

// Load book_tags.csv
function loadBookTagsCSV() {
  return new Promise((resolve, reject) => {
    const bookTags = [];
    const csvPath = path.join(__dirname, '../../goodbooks-10k-master/goodbooks-10k-master/book_tags.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ Book tags CSV file not found:', csvPath);
      resolve([]); // Continue without tags
      return;
    }
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          bookTags.push({
            goodreads_book_id: parseInt(row.goodreads_book_id),
            tag_id: parseInt(row.tag_id),
            count: parseInt(row.count)
          });
        } catch (error) {
          console.error('Error parsing book tag row:', error);
        }
      })
      .on('end', () => {
        console.log(`🏷️  Loaded ${bookTags.length} book tags from CSV`);
        resolve(bookTags);
      })
      .on('error', reject);
  });
}

// Load tags.csv
function loadTagsCSV() {
  return new Promise((resolve, reject) => {
    const tags = [];
    const csvPath = path.join(__dirname, '../../goodbooks-10k-master/goodbooks-10k-master/tags.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ Tags CSV file not found:', csvPath);
      resolve([]); // Continue without tags
      return;
    }
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          tags.push({
            tag_id: parseInt(row.tag_id),
            tag_name: row.tag_name
          });
        } catch (error) {
          console.error('Error parsing tag row:', error);
        }
      })
      .on('end', () => {
        console.log(`🏷️  Loaded ${tags.length} tags from CSV`);
        resolve(tags);
      })
      .on('error', reject);
  });
}

// Load ratings.csv
function loadRatingsCSV() {
  return new Promise((resolve, reject) => {
    const ratings = [];
    const csvPath = path.join(__dirname, '../../goodbooks-10k-master/goodbooks-10k-master/ratings.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ Ratings CSV file not found:', csvPath);
      resolve([]); // Continue without ratings
      return;
    }
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          ratings.push({
            user_id: parseInt(row.user_id),
            book_id: parseInt(row.book_id),
            rating: parseInt(row.rating)
          });
        } catch (error) {
          console.error('Error parsing rating row:', error);
        }
      })
      .on('end', () => {
        console.log(`⭐ Loaded ${ratings.length} ratings from CSV`);
        resolve(ratings);
      })
      .on('error', reject);
  });
}

// Load to_read.csv
function loadToReadCSV() {
  return new Promise((resolve, reject) => {
    const toRead = [];
    const csvPath = path.join(__dirname, '../../goodbooks-10k-master/goodbooks-10k-master/to_read.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ To-read CSV file not found:', csvPath);
      resolve([]); // Continue without to-read data
      return;
    }
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          toRead.push({
            user_id: parseInt(row.user_id),
            book_id: parseInt(row.book_id)
          });
        } catch (error) {
          console.error('Error parsing to-read row:', error);
        }
      })
      .on('end', () => {
        console.log(`📚 Loaded ${toRead.length} to-read entries from CSV`);
        resolve(toRead);
      })
      .on('error', reject);
  });
}

// Helper: Map enriched book data to Content schema
function mapEnrichedBookToContent(book) {
  // Use fallback book image if no cover available
  const coverUrl = book.image_url || '/Books.png';
  const smallCoverUrl = book.small_image_url || '/Books.png';
  
  return {
    type: 'book',
    title: book.title,
    description: book.original_title || '',
    genres: book.genres || [],
    authors: book.authors ? book.authors.split(',').map(a => a.trim()) : [],
    releaseDate: book.original_publication_year ? `${book.original_publication_year}-01-01` : '',
    externalId: book.book_id.toString(),
    rating: book.enhanced_rating || book.average_rating,
    ratingCount: book.enhanced_rating_count || book.ratings_count,
    views: book.work_ratings_count,
    metadata: {
      cover: coverUrl,
      small_cover: smallCoverUrl,
      isbn: book.isbn,
      isbn13: book.isbn13,
      language_code: book.language_code,
      goodreads_book_id: book.goodreads_book_id,
      work_id: book.work_id,
      books_count: book.books_count,
      work_text_reviews_count: book.work_text_reviews_count,
      original_publication_year: book.original_publication_year,
      to_read_count: book.to_read_count,
      all_tags: book.all_tags || [],
      enhanced_rating: book.enhanced_rating,
      enhanced_rating_count: book.enhanced_rating_count,
      ratings_breakdown: {
        '1': book.ratings_1,
        '2': book.ratings_2,
        '3': book.ratings_3,
        '4': book.ratings_4,
        '5': book.ratings_5
      }
    },
    createdAt: new Date(),
  };
}

function mapContentForFrontend(content) {
  return {
    id: content.externalId,
    type: content.type,
    title: content.title,
    description: content.description,
    authors: content.authors || [],
    genres: content.genres || [],
    releaseDate: content.releaseDate,
    coverImageUrl: content.metadata?.cover || '',
    averageRating: content.rating || 0,
    ratingCount: content.ratingCount || 0,
    views: content.views || 0,
    metadata: content.metadata || {},
    createdAt: content.createdAt,
    // Additional fields for compatibility
    original_title: content.description,
    language_code: content.metadata?.language_code,
    ratings_count: content.ratingCount,
    work_ratings_count: content.views,
    image_url: content.metadata?.cover || '',
    small_image_url: content.metadata?.small_cover || '',
    isbn: content.metadata?.isbn,
    isbn13: content.metadata?.isbn13,
    original_publication_year: content.metadata?.original_publication_year,
    to_read_count: content.metadata?.to_read_count || 0,
    enhanced_rating: content.metadata?.enhanced_rating || 0,
    enhanced_rating_count: content.metadata?.enhanced_rating_count || 0
  };
}

// GET /api/books?query=... - search enriched books with pagination
router.get('/', async (req, res) => {
  const { query, limit = 20, page = 1 } = req.query;
  
  try {
    const enrichedBooks = await loadEnrichedBooksFromCSV();
    
    let filteredBooks = enrichedBooks;
    
    // Apply search filter if query provided
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredBooks = enrichedBooks.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.original_title?.toLowerCase().includes(searchTerm) ||
        (Array.isArray(book.authors) && book.authors.some(author => author.toLowerCase().includes(searchTerm))) ||
        book.genres?.some(genre => genre.toLowerCase().includes(searchTerm))
      );
    }
    
    // Sort by enhanced rating and popularity
    filteredBooks.sort((a, b) => {
      const scoreA = (a.enhanced_rating * a.enhanced_rating_count) + (a.to_read_count * 0.1);
      const scoreB = (b.enhanced_rating * b.enhanced_rating_count) + (b.to_read_count * 0.1);
      return scoreB - scoreA;
    });
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
    
    // Convert to Content format
    const contentBooks = paginatedBooks.map(mapEnrichedBookToContent);
    
    // Cache in MongoDB (optional)
    if (Content) {
      await Content.insertMany(contentBooks, { ordered: false }).catch(() => {});
    }
    
    res.json({ 
      books: contentBooks.map(mapContentForFrontend),
      total: filteredBooks.length,
      page: pageNum,
      limit: limitNum,
      hasMore: endIndex < filteredBooks.length
    });
    
  } catch (error) {
    console.error('Books fetch error:', error.message);
    res.status(500).json({ message: 'Failed to fetch books' });
  }
});

// GET /api/books/popular - get popular enriched books
router.get('/popular', async (req, res) => {
  try {
    const enrichedBooks = await loadEnrichedBooksFromCSV();
    
    // Sort by popularity (enhanced rating * count + to_read_count)
    const popularBooks = enrichedBooks
      .sort((a, b) => {
        const scoreA = (a.enhanced_rating * a.enhanced_rating_count) + (a.to_read_count * 0.1);
        const scoreB = (b.enhanced_rating * b.enhanced_rating_count) + (b.to_read_count * 0.1);
        return scoreB - scoreA;
      })
      .slice(0, 20)
      .map(mapEnrichedBookToContent);
    
    res.json({ 
      books: popularBooks.map(mapContentForFrontend)
    });
    
  } catch (error) {
    console.error('Popular books fetch error:', error.message);
    res.status(500).json({ message: 'Failed to fetch popular books' });
  }
});

// GET /api/books/:id - get enriched book by ID
router.get('/:id', async (req, res) => {
  try {
    const enrichedBooks = await loadEnrichedBooksFromCSV();
    const book = enrichedBooks.find(b => b.book_id.toString() === req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    const contentBook = mapEnrichedBookToContent(book);
    res.json({ book: mapContentForFrontend(contentBook) });
    
  } catch (error) {
    console.error('Book fetch error:', error.message);
    res.status(500).json({ message: 'Failed to fetch book' });
  }
});

// GET /api/books/genres/:genre - get books by genre
router.get('/genres/:genre', async (req, res) => {
  const { genre } = req.params;
  const { limit = 20, page = 1 } = req.query;
  
  try {
    const enrichedBooks = await loadEnrichedBooksFromCSV();
    
    // Filter books by genre
    const genreBooks = enrichedBooks.filter(book => 
      book.genres?.some(g => g.toLowerCase().includes(genre.toLowerCase()))
    );
    
    // Sort by popularity
    genreBooks.sort((a, b) => {
      const scoreA = (a.enhanced_rating * a.enhanced_rating_count) + (a.to_read_count * 0.1);
      const scoreB = (b.enhanced_rating * b.enhanced_rating_count) + (b.to_read_count * 0.1);
      return scoreB - scoreA;
    });
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedBooks = genreBooks.slice(startIndex, endIndex);
    
    const contentBooks = paginatedBooks.map(mapEnrichedBookToContent);
    
    res.json({ 
      books: contentBooks.map(mapContentForFrontend),
      total: genreBooks.length,
      page: pageNum,
      limit: limitNum,
      hasMore: endIndex < genreBooks.length,
      genre: genre
    });
    
  } catch (error) {
    console.error('Genre books fetch error:', error.message);
    res.status(500).json({ message: 'Failed to fetch genre books' });
  }
});

module.exports = router; 