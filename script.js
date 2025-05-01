document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.getElementById('landing-page');
    const contentPage = document.getElementById('content-page');
    const fadeElements = document.querySelectorAll('.fade-up');
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const counterElement = document.getElementById('hit-count');

    // Initialize auto-typing effect
    let typed;
    let player;

    // Track if user has manually set volume
    let userHasSetVolume = false;

    // Call updateViewCount when the page loads
    updateViewCount();

    // Initialize Vimeo player
    function initializePlayer() {
        const iframe = document.getElementById('background-video');
        player = new Vimeo.Player(iframe, {
            background: true,
            autopause: false,
            muted: true,
            playsinline: true
        });

        // Set initial volume to 0 due to autoplay restrictions
        player.setVolume(0);

        // Force playsinline attribute for mobile devices
        player.element.setAttribute('playsinline', '');
        player.element.setAttribute('webkit-playsinline', '');
        player.element.setAttribute('muted', 'muted');

        // Additional attributes for better mobile support
        if (iframe.parentNode) {
            iframe.parentNode.style.transform = 'translateZ(0)'; // Hardware acceleration
        }

        // Disable autopause to keep playing when tab is not active
        player.setAutopause(false).catch(error => {
            console.error("Error setting autopause:", error);
        });

        // Explicitly pause the player to ensure it doesn't autoplay
        player.pause().catch(error => {
            console.error("Error pausing video:", error);
        });
    }

    // Initialize player
    initializePlayer();
    setupMobileAppSwitchHandling();

    // Function to update view count
    function updateViewCount() {
        const counterElement = document.getElementById('hit-count');
        if (!counterElement) return;
      
        // Clear previous content
        counterElement.innerHTML = '';
      
        // Create container
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'center';
      
        // Create image
        const viewCounterImg = document.createElement('img');
        viewCounterImg.src = "https://views-counter.vercel.app/badge?pageId=exerlie%2Exyz&leftColor=000000&rightColor=000000&type=total&label=%F0%9F%91%81&style=none";
        viewCounterImg.alt = "views";
        viewCounterImg.style.height = "20px";
        viewCounterImg.style.display = "inline-block";
        viewCounterImg.style.visibility = "visible";
        viewCounterImg.style.opacity = "1";
      
        // Append image to container, and container to counter
        container.appendChild(viewCounterImg);
        counterElement.appendChild(container);
      
        // Force parent visibility
        const viewCounterDiv = document.querySelector('.view-counter');
        if (viewCounterDiv) {
          viewCounterDiv.style.display = "flex";
          viewCounterDiv.style.visibility = "visible";
          viewCounterDiv.style.opacity = "1";
          viewCounterDiv.style.zIndex = "99999";
        }
      
        // Ensure styles on mobile
        if (window.innerWidth <= 767) {
          viewCounterImg.style.height = "22px";
          if (viewCounterDiv) {
            viewCounterDiv.style.zIndex = "99999";
            viewCounterDiv.style.bottom = "20px";
            viewCounterDiv.style.left = "10px";
          }
        }
      }

    // Check if on mobile device
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // If on mobile, make volume slider bigger for touch devices
    if (isMobileDevice()) {
        volumeSlider.classList.add('mobile-friendly');
    }

    // Special handler for mobile devices
    if (isMobileDevice()) {
        document.addEventListener('touchstart', function () {
            if (landingPage.classList.contains('hidden')) {
                player.play().catch(error => {
                    console.error("Error playing video on mobile:", error);
                });

                // Try to enable audio after user interaction on mobile
                setTimeout(() => {
                    if (!userHasSetVolume) {
                        player.setVolume(0.5).then(() => {
                            soundIcon.classList.remove('fa-volume-mute');
                            soundIcon.classList.add('fa-volume-up');
                            volumeSlider.value = 0.5;
                        }).catch(err => console.error("Error setting volume on mobile:", err));
                    }
                }, 1000);
            }
        }, { passive: true });
    }

    // Volume slider functionality
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            userHasSetVolume = true;

            // Set volume using Vimeo API
            player.setVolume(value).then(() => {
                // Update icon based on volume level
                if (value === 0) {
                    soundIcon.classList.remove('fa-volume-up');
                    soundIcon.classList.add('fa-volume-mute');
                } else {
                    soundIcon.classList.remove('fa-volume-mute');
                    soundIcon.classList.add('fa-volume-up');
                }
            }).catch(error => {
                console.error("Error setting volume:", error);
            });
        });

        // Add touch events specifically for mobile
        volumeSlider.addEventListener('touchend', (e) => {
            const value = parseFloat(e.target.value);
            player.setVolume(value);
        });
    }

    // Sound toggle button functionality
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            player.getVolume().then(volume => {
                if (volume > 0) {
                    // Store the current volume before muting
                    volumeSlider.dataset.previousVolume = volume;
                    player.setVolume(0);
                    volumeSlider.value = 0;
                    soundIcon.classList.remove('fa-volume-up');
                    soundIcon.classList.add('fa-volume-mute');
                } else {
                    // Restore previous volume or set to 0.5
                    const newVolume = parseFloat(volumeSlider.dataset.previousVolume) || 0.5;
                    player.setVolume(newVolume);
                    volumeSlider.value = newVolume;
                    soundIcon.classList.remove('fa-volume-mute');
                    soundIcon.classList.add('fa-volume-up');
                }
            });
        });
    }

    // Main enter button click handler
    landingPage.addEventListener('click', () => {
        // Start transition
        landingPage.style.opacity = '0';

        // After fade out, hide landing page, show content, and start playing video
        setTimeout(() => {
            landingPage.classList.add('hidden');
            contentPage.classList.remove('hidden');
            contentPage.style.opacity = '1';

            // Now play the video after user interaction
            document.querySelector('.video-background').classList.add('active');
            player.play().then(() => {
                // Set volume to 0.5 after user interaction ONLY if user hasn't set it manually
                if (!userHasSetVolume) {
                    setTimeout(() => {
                        player.setVolume(0.5).then(() => {
                            soundIcon.classList.remove('fa-volume-mute');
                            soundIcon.classList.add('fa-volume-up');
                            volumeSlider.value = 0.5;
                        });
                    }, 1000);
                }
            }).catch(error => {
                console.error("Error playing video after landing page:", error);
            });

            // Activate fade-up elements with delay
            fadeElements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add('active');

                    // Start typing effect after the h2 element fades in
                    if (index === 1) {
                        setTimeout(() => {
                            initTyped();
                        }, 300);
                    }
                }, 300 + (index * 200));
            });
        }, 800);
    });

    // Function to initialize typed.js
    function initTyped() {
        typed = new Typed('#auto-type', {
            strings: [
                "diddy ruined meek mill",
                "hi <img src='peepo.gif' style='height:1em;vertical-align:middle;'>",
                "bonjour",
                "i love kanye"
            ],
            typeSpeed: 130,
            backSpeed: 130,
            loop: true,
            showCursor: true,
            cursorChar: '|',
            smartBackspace: true,
            startDelay: 500,
            backDelay: 2000,
            preStringTyped: function (arrayPos, self) {
                // Clear the element content before typing the next string
                self.el.innerHTML = '';
            }
        });
    }

    // Improved visibilitychange handler for mobile devices
    document.addEventListener('visibilitychange', function () {
        // Only handle if we're past the landing page
        if (landingPage.classList.contains('hidden')) {
            if (document.visibilityState === 'visible') {
                // When tab becomes visible again, ensure video is playing
                player.getPaused().then(paused => {
                    if (paused) {
                        player.play().then(() => {
                            // Restore volume setting based on user preference
                            const volumeValue = parseFloat(volumeSlider.value);
                            player.setVolume(volumeValue);
                        }).catch(error => {
                            console.error("Error resuming video:", error);
                            // Try again with a delay as a fallback
                            setTimeout(() => {
                                player.play().catch(e => console.error("Retry failed:", e));
                            }, 1000);
                        });
                    }
                });
            } else {
                // When tab becomes hidden, set a flag to check if we need to resume later
                window.wasBackgrounded = true;
            }
        }
    });

    // Add this function to handle mobile app switching
    function setupMobileAppSwitchHandling() {
        if (isMobileDevice()) {
            // For iOS devices
            window.addEventListener('pagehide', function () {
                window.wasBackgrounded = true;
            });

            window.addEventListener('pageshow', function () {
                if (window.wasBackgrounded && landingPage.classList.contains('hidden')) {
                    player.getPaused().then(paused => {
                        if (paused) {
                            player.play().catch(error => {
                                console.error("Error resuming after pageshow:", error);
                            });
                        }
                    });
                    window.wasBackgrounded = false;
                }
            });

            // For Android devices
            document.addEventListener('resume', function () {
                if (landingPage.classList.contains('hidden')) {
                    player.getPaused().then(paused => {
                        if (paused) {
                            player.play().catch(error => {
                                console.error("Error resuming after resume event:", error);
                            });
                        }
                    });
                }
            });

            // Create a heartbeat to check video status periodically
            setInterval(function () {
                if (landingPage.classList.contains('hidden')) {
                    player.getPaused().then(paused => {
                        if (paused && document.visibilityState === 'visible') {
                            player.play().catch(error => {
                                console.error("Error resuming from heartbeat:", error);
                            });
                        }
                    });
                }
            }, 5000); // Check every 5 seconds
        }
    }

    // Disable right-click
    document.addEventListener('contextmenu', event => event.preventDefault());

    // Title auto-typing effect
    function titleTypingEffect() {
        const titles = ["@cursive"];
        let currentIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentTitle = titles[currentIndex];

            if (isDeleting) {
                // Deleting text
                charIndex--;
                document.title = currentTitle.substring(0, charIndex) || "@";
            } else {
                // Typing text
                charIndex++;
                document.title = currentTitle.substring(0, charIndex);
            }

            // Typing speed
            let typeSpeed = isDeleting ? 150 : 200;

            // If complete word
            if (!isDeleting && charIndex >= currentTitle.length) {
                // Pause at end of word
                typeSpeed = 900;
                isDeleting = true;
            } else if (isDeleting && charIndex <= 0) {
                isDeleting = false;
                charIndex = 0;
                // Move to next title (with wrapping)
                currentIndex = (currentIndex + 1) % titles.length;
                // Pause before typing next word
                typeSpeed = 200;
            }

            setTimeout(type, typeSpeed);
        }

        // Start the typing effect
        type();
    }

    // Call the title typing effect
    titleTypingEffect();
});
