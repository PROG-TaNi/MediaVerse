import pandas as pd
import json

# Examine movies dataset
print("=== MOVIES DATASET ===")
try:
    movies_df = pd.read_csv('moviedataset/tmdb_5000_movies.csv')
    print("Columns:", movies_df.columns.tolist())
    print("Shape:", movies_df.shape)
    print("\nFirst 2 rows:")
    print(movies_df.head(2).to_string())
    print("\nSample movie data:")
    sample_movie = movies_df.iloc[0]
    print(json.dumps(sample_movie.to_dict(), indent=2, default=str))
except Exception as e:
    print(f"Error reading movies: {e}")

print("\n" + "="*50 + "\n")

# Examine books dataset
print("=== BOOKS DATASET ===")
try:
    books_df = pd.read_csv('goodbooks-10k-master/books.csv')
    print("Columns:", books_df.columns.tolist())
    print("Shape:", books_df.shape)
    print("\nFirst 2 rows:")
    print(books_df.head(2).to_string())
    print("\nSample book data:")
    sample_book = books_df.iloc[0]
    print(json.dumps(sample_book.to_dict(), indent=2, default=str))
except Exception as e:
    print(f"Error reading books: {e}")

print("\n" + "="*50 + "\n")

# Examine ratings dataset
print("=== RATINGS DATASET ===")
try:
    ratings_df = pd.read_csv('goodbooks-10k-master/ratings.csv')
    print("Columns:", ratings_df.columns.tolist())
    print("Shape:", ratings_df.shape)
    print("\nFirst 2 rows:")
    print(ratings_df.head(2).to_string())
except Exception as e:
    print(f"Error reading ratings: {e}")

print("\n" + "="*50 + "\n")

# Examine tags dataset
print("=== TAGS DATASET ===")
try:
    tags_df = pd.read_csv('goodbooks-10k-master/tags.csv')
    print("Columns:", tags_df.columns.tolist())
    print("Shape:", tags_df.shape)
    print("\nFirst 2 rows:")
    print(tags_df.head(2).to_string())
except Exception as e:
    print(f"Error reading tags: {e}") 