import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPopularMovies, getImageUrl } from '../services/tmdb';

const LandingAnimation = () => {
  const navigate = useNavigate();
  const cardsContainerRef = useRef(null);
  const animationStarted = useRef(false);

  useEffect(() => {
    const fetchAndPopulateMovies = async () => {
      try {
        const movies = await getPopularMovies();
        if (!cardsContainerRef.current) return;

        // Clear existing children
        cardsContainerRef.current.innerHTML = '';

        // Build cards
        movies.forEach(movie => {
          if (movie.poster_path) {
            const card = document.createElement('div');
            card.classList.add('movie-card');
            const img = document.createElement('img');
            img.src = getImageUrl(movie.poster_path, 'w185');
            img.alt = movie.title;
            card.appendChild(img);
            cardsContainerRef.current.appendChild(card);
          }
        });

        // Clone for seamless loop
        const originalCards = Array.from(cardsContainerRef.current.children);
        originalCards.forEach(clone => {
          const copy = clone.cloneNode(true);
          cardsContainerRef.current.appendChild(copy);
        });

        // Set tray width
        requestAnimationFrame(() => {
          let singleSetWidth = 0;
          originalCards.forEach(cardEl => {
            const style = getComputedStyle(cardEl);
            const marginRight = parseFloat(style.marginRight);
            singleSetWidth += cardEl.offsetWidth + marginRight;
          });
          cardsContainerRef.current.style.setProperty('--tray-width', `${singleSetWidth}px`);
        });
      } catch (err) {
        console.error('Failed to fetch TMDB data:', err);
      }
    };

    const triggerAnimation = () => {
      if (animationStarted.current) return;
      animationStarted.current = true;

      const hero = document.getElementById('hero');
      const newContent = document.querySelector('.new-content');
      const profileCard = document.getElementById('profile-card');
      const cardTray = document.getElementById('card-tray');

      hero.classList.add('animate-hero', 'show-new');

      setTimeout(() => {
        newContent.classList.add('move-right');
        profileCard.classList.add('show');

        setTimeout(() => {
          cardTray.classList.add('show');
          fetchAndPopulateMovies();
          
          // Navigate to home page after animation
          setTimeout(() => {
            navigate('/home');
          }, 2000);
        }, 500);
      }, 1000);
    };

    // Add event listeners
    const headline = document.getElementById('headline-click');
    if (headline) {
      headline.addEventListener('click', triggerAnimation);
    }
    document.addEventListener('keydown', triggerAnimation);

    return () => {
      if (headline) {
        headline.removeEventListener('click', triggerAnimation);
      }
      document.removeEventListener('keydown', triggerAnimation);
    };
  }, [navigate]);

  return (
    <section className="hero" id="hero">
      <nav>
        <div className="logo">MediaVerse</div>
        <ul className="nav-links">
          <li><a href="/home">Home</a></li>
          <li><a href="/movies">Movies</a></li>
          <li><a href="/books">Books</a></li>
          <li><a href="/music">Music</a></li>
          <li><a href="/podcasts">Podcasts</a></li>
          <li><a href="/articles">Articles</a></li>
        </ul>
        <div className="profile"><i className="fas fa-user-circle"></i></div>
      </nav>

      <div className="hero-content">
        <h1>MediaVerse</h1>
        <h2 id="headline-click">Let's Start</h2>
      </div>

      <div className="new-content">WELCOME BACK</div>

      <div className="profile-card" id="profile-card">
        <div className="profile-overlay"></div>
        <h3>John Doe</h3>
        <p>Movie Enthusiast<br />New York, NY</p>
      </div>

      <div className="card-tray" id="card-tray">
        <div className="cards-container" ref={cardsContainerRef}></div>
      </div>
    </section>
  );
};

export default LandingAnimation;