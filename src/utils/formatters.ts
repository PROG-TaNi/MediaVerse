export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const generateStarRating = (rating: number): string[] => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  
  const stars = [];
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push('full');
  }
  
  // Add half star if needed
  if (hasHalfStar) {
    stars.push('half');
  }
  
  // Add empty stars (out of 10)
  const emptyStars = 10 - stars.length;
  for (let i = 0; i < emptyStars; i++) {
    stars.push('empty');
  }
  
  return stars;
};