
document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. COUNTDOWN TIMER
  // ==========================================
  const countdownElement = document.getElementById('countdown');
  const targetDateStr = countdownElement.getAttribute('data-date');
  const targetDate = new Date(targetDateStr).getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      document.getElementById('days').innerText = '00';
      document.getElementById('hours').innerText = '00';
      document.getElementById('minutes').innerText = '00';
      document.getElementById('seconds').innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = days.toString().padStart(2, '0');
    document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
    document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
  }

  // Initial call and set interval
  updateCountdown();
  setInterval(updateCountdown, 1000);


  // ==========================================
  // 2. AUDIO PLAYER CONTROL
  // ==========================================
  const bgAudio = document.getElementById('bg-audio');
  const audioToggle = document.getElementById('audio-toggle');
  const musicWave = audioToggle.querySelector('.music-wave');
  const audioStatusText = document.getElementById('audio-status-text');
  let isPlaying = false;

  // Reduce default volume to be soft ambient
  bgAudio.volume = 0.35;

  function togglePlay() {
    if (isPlaying) {
      bgAudio.pause();
      musicWave.classList.remove('playing');
      audioStatusText.innerText = 'PLAY MUSIC';
      isPlaying = false;
    } else {
      // Browsers require user interaction before playing audio
      bgAudio.play().then(() => {
        musicWave.classList.add('playing');
        audioStatusText.innerText = 'PAUSE MUSIC';
        isPlaying = true;
      }).catch(err => {
        console.log("Audio play blocked/failed:", err);
      });
    }
  }

  audioToggle.addEventListener('click', togglePlay);

  // Attempt to play on first click anywhere on body to handle browser restrictions
  const startPlayOnInteraction = () => {
    if (!isPlaying) {
      bgAudio.play().then(() => {
        musicWave.classList.add('playing');
        audioStatusText.innerText = 'PAUSE MUSIC';
        isPlaying = true;
        document.body.removeEventListener('click', startPlayOnInteraction);
      }).catch(() => {});
    }
  };
  document.body.addEventListener('click', startPlayOnInteraction);


  // ==========================================
  // 3. DYNAMIC GOOGLE MAPS DIRECTIONS LINKS
  // ==========================================
  const scheduleCards = document.querySelectorAll('.schedule-card');
  
  scheduleCards.forEach(card => {
    const addressElement = card.querySelector('.venue-address');
    const venueNameElement = card.querySelector('.venue-name');
    const mapsBtn = card.querySelector('.map-directions-link');
    
    if (addressElement && mapsBtn) {
      const locationQuery = `${venueNameElement ? venueNameElement.innerText + ', ' : ''}${addressElement.innerText}`;
      // Official Google Maps Directions API URL format:
      mapsBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationQuery)}`;
    }
  });


  // ==========================================
  // 4. ADD TO CALENDAR BUTTONS (.ICS & GOOGLE)
  // ==========================================
  // Toggle Dropdown menus
  const calendarDropdowns = document.querySelectorAll('.calendar-dropdown');
  
  calendarDropdowns.forEach(dropdown => {
    const toggleBtn = dropdown.querySelector('.calendar-toggle-btn');
    const menu = dropdown.querySelector('.calendar-menu');
    
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns first
      calendarDropdowns.forEach(d => {
        if (d !== dropdown) {
          d.querySelector('.calendar-menu').classList.remove('show');
          d.querySelector('.calendar-toggle-btn').setAttribute('aria-expanded', 'false');
        }
      });
      const isShowing = menu.classList.toggle('show');
      toggleBtn.setAttribute('aria-expanded', isShowing ? 'true' : 'false');
    });
  });

  // Close dropdowns when clicking anywhere outside
  document.addEventListener('click', () => {
    calendarDropdowns.forEach(dropdown => {
      dropdown.querySelector('.calendar-menu').classList.remove('show');
      dropdown.querySelector('.calendar-toggle-btn').setAttribute('aria-expanded', 'false');
    });
  });

  // Populate calendar links dynamically
  scheduleCards.forEach(card => {
    const title = card.getAttribute('data-event-title');
    const start = card.getAttribute('data-event-start');
    const end = card.getAttribute('data-event-end');
    const location = card.getAttribute('data-event-location');
    const description = card.getAttribute('data-event-description');

    const googleBtn = card.querySelector('.google-cal-btn');
    const icsBtn = card.querySelector('.ics-cal-btn');

    if (googleBtn) {
      googleBtn.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}`;
    }

    if (icsBtn) {
      icsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Eleanor & Julian Wedding//NONSGML v1.0//EN',
          'BEGIN:VEVENT',
          `UID:${start}-${title.replace(/\s+/g, '-').toLowerCase()}`,
          `DTSTART:${start}`,
          `DTEND:${end}`,
          `SUMMARY:${title}`,
          `DESCRIPTION:${description}`,
          `LOCATION:${location}`,
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    }
  });


  // ==========================================
  // 5. SMOOTH SCROLLING & BOTTOM NAV SCROLLSPY
  // ==========================================
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
  
  internalLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      // If just '#' or empty, do standard browser behavior or top scroll
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        // Offset for floating navbar height
        const navbarHeight = document.getElementById('navbar').offsetHeight || 70;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Immediately highlight clicked bottom nav link
        bottomNavItems.forEach(item => {
          if (item.getAttribute('href') === targetId) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  });

  // IntersectionObserver to dynamically highlight bottom navigation links as user scrolls
  const observerSections = [
    document.getElementById('hero'),
    document.getElementById('invitation'),
    document.getElementById('schedule')
  ].filter(el => el !== null);

  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -30% 0px', // trigger when section occupies middle 40% of viewport
    threshold: 0
  };

  const scrollspyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        bottomNavItems.forEach(item => {
          const href = item.getAttribute('href');
          if (href === `#${id}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  observerSections.forEach(section => scrollspyObserver.observe(section));



});
