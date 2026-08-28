// Configurable backend endpoint for RSVP form submissions (e.g. Formspree, Google Apps Script, Supabase)
const RSVP_ENDPOINT = 'YOUR_BACKEND_ENDPOINT_URL'; 

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
  // 5. SMOOTH SCROLLING FOR INTERNAL LINKS
  // ==========================================
  const internalLinks = document.querySelectorAll('a[href^="#"]');
  
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
      }
    });
  });


  // ==========================================
  // 6. RSVP FORM DYNAMIC VISIBILITY
  // ==========================================
  const rsvpForm = document.getElementById('rsvp-form');
  const attendanceRadios = document.getElementsByName('attendance');
  const attendingDetails = document.getElementById('attending-details');
  const headcountSelect = document.getElementById('headcount');
  const dietaryInput = document.getElementById('dietary');

  function handleAttendanceChange() {
    const selectedAttendance = document.querySelector('input[name="attendance"]:checked').value;
    
    if (selectedAttendance === 'attending') {
      attendingDetails.classList.remove('collapsed');
      headcountSelect.required = true;
    } else {
      attendingDetails.classList.add('collapsed');
      headcountSelect.required = false;
      // Clear inputs when declining
      headcountSelect.value = '1';
      dietaryInput.value = '';
    }
  }

  attendanceRadios.forEach(radio => {
    radio.addEventListener('change', handleAttendanceChange);
  });

  // Run initial state setup
  handleAttendanceChange();


  // ==========================================
  // 7. RSVP FORM SUBMISSION (ASYNC FETCH WITH INLINE FEEDBACK)
  // ==========================================
  const successOverlay = document.getElementById('success-overlay');
  const successText = document.getElementById('success-text');
  const editRsvpBtn = document.getElementById('edit-rsvp-btn');
  const rsvpErrorBox = document.getElementById('rsvp-error');
  const submitBtn = document.getElementById('submit-btn');

  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset state
    rsvpErrorBox.classList.add('hidden');
    rsvpErrorBox.innerText = '';
    
    const guestName = document.getElementById('guest-name').value;
    const email = document.getElementById('guest-email').value;
    const attendance = document.querySelector('input[name="attendance"]:checked').value;
    const headcount = attendance === 'attending' ? headcountSelect.value : '0';
    const dietary = attendance === 'attending' ? (dietaryInput.value || 'None') : '';

    const payload = {
      name: guestName,
      email: email,
      attendance: attendance,
      headcount: parseInt(headcount, 10),
      dietary: dietary,
      submittedAt: new Date().toISOString()
    };

    // UI Loading State
    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending...';
    
    // Disable inputs during submission
    const inputs = rsvpForm.querySelectorAll('input, select, button');
    inputs.forEach(el => el.disabled = true);

    try {
      // Handle actual fetch or simulate if endpoint is not configured
      if (RSVP_ENDPOINT.startsWith('YOUR_')) {
        // Simulate a successful network request with delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock error test (uncomment to test error UI):
        // throw new Error('Simulation Error: Could not connect to API.');
      } else {
        const response = await fetch(RSVP_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Failed to submit RSVP. Please try again later.');
        }
      }

      // Success State UI Transitions
      if (attendance === 'attending') {
        successText.innerHTML = `Thank you, <strong>${guestName}</strong>! We've registered <strong>${headcount}</strong> guest(s) under <strong>${email}</strong>.<br><br>We are so thrilled to celebrate our special day with you!`;
      } else {
        successText.innerHTML = `Thank you, <strong>${guestName}</strong>, for letting us know.<br><br>While we are sad you won't be able to make it, we look forward to celebrating from afar!`;
      }

      successOverlay.classList.remove('hidden');
      document.getElementById('rsvp').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
      console.error('RSVP Submission Error:', error);
      rsvpErrorBox.innerText = error.message || 'An unexpected error occurred. Please try again.';
      rsvpErrorBox.classList.remove('hidden');
    } finally {
      // Re-enable form controls
      inputs.forEach(el => el.disabled = false);
      submitBtn.disabled = false;
      submitBtn.innerText = 'Send RSVP';
    }
  });

  // Edit Response Button functionality
  editRsvpBtn.addEventListener('click', () => {
    successOverlay.classList.add('hidden');
  });

});
