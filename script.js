document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.getElementById('landing-page');
    const contentPage = document.getElementById('content-page');
    const fadeElements = document.querySelectorAll('.fade-up');
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const counterElement = document.getElementById('hit-count');

    let typed;
    let player;
    let userHasSetVolume = false;

    updateViewCount();

    function initializePlayer() {
        const iframe = document.getElementById('background-video');
        player = new Vimeo.Player(iframe, {
            background: true,
            autopause: false,
            muted: true,
            playsinline: true
        });

        player.setVolume(0);

        player.element.setAttribute('playsinline', '');
        player.element.setAttribute('webkit-playsinline', '');
        player.element.setAttribute('muted', 'muted');

        if (iframe.parentNode) {
            iframe.parentNode.style.transform = 'translateZ(0)';
        }

        player.setAutopause(false).catch(error => {
            console.error("Error setting autopause:", error);
        });

        player.pause().catch(error => {
            console.error("Error pausing video:", error);
        });
    }

    initializePlayer();
    setupMobileAppSwitchHandling();

    function updateViewCount() {
        const counterElement = document.getElementById('hit-count');
        
        if (!counterElement) {
            console.error("Counter element not found");
            return;
        }
        
        counterElement.innerHTML = '';
        
        const viewCounterImg = document.createElement('img');
        viewCounterImg.src = "https://views-counter.vercel.app/badge?pageId=exerlie%2Exyz&leftColor=000000&rightColor=000000&type=total&label=%F0%9F%91%81&style=none";
        viewCounterImg.alt = "views";
        counterElement.appendChild(viewCounterImg);
    }

    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    if (isMobileDevice()) {
        volumeSlider.classList.add('mobile-friendly');
    }

    if (isMobileDevice()) {
        document.addEventListener('touchstart', function () {
            if (landingPage.classList.contains('hidden')) {
                player.play().catch(error => {
                    console.error("Error playing video on mobile:", error);
                });

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

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            userHasSetVolume = true;

            player.setVolume(value).then(() => {
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

        volumeSlider.addEventListener('touchend', (e) => {
            const value = parseFloat(e.target.value);
            player.setVolume(value);
        });
    }

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            player.getVolume().then(volume => {
                if (volume > 0) {
                    volumeSlider.dataset.previousVolume = volume;
                    player.setVolume(0);
                    volumeSlider.value = 0;
                    soundIcon.classList.remove('fa-volume-up');
                    soundIcon.classList.add('fa-volume-mute');
                } else {
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
        landingPage.style.opacity = '0';

        setTimeout(() => {
            landingPage.classList.add('hidden');
            contentPage.classList.remove('hidden');
            contentPage.style.opacity = '1';

            document.querySelector('.video-background').classList.add('active');
            
            // Listen for when video starts playing and remove background image
            player.on('play', function() {
                console.log('Video started playing - removing background image');
                document.querySelector('.video-background').classList.add('video-playing');
            });
            
            player.play().then(() => {
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

            fadeElements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add('active');

                    if (index === 1) {
                        setTimeout(() => {
                            initTyped();
                        }, 300);
                    }
                }, 300 + (index * 200));
            });
        }, 800);
    });

    function initTyped() {
        typed = new Typed('#auto-type', {
            strings: [
                "diam jap",
                "ahah ah ahha",
                "hi <img src='peepo.gif' style='height:1em;vertical-align:middle;'>",
                "are u bele?"
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
                self.el.innerHTML = '';
            }
        });
    }

    document.addEventListener('visibilitychange', function () {
        if (landingPage.classList.contains('hidden')) {
            if (document.visibilityState === 'visible') {
                player.getPaused().then(paused => {
                    if (paused) {
                        player.play().then(() => {
                            const volumeValue = parseFloat(volumeSlider.value);
                            player.setVolume(volumeValue);
                        }).catch(error => {
                            console.error("Error resuming video:", error);
                            setTimeout(() => {
                                player.play().catch(e => console.error("Retry failed:", e));
                            }, 1000);
                        });
                    }
                });
            } else {
                window.wasBackgrounded = true;
            }
        }
    });

    function setupMobileAppSwitchHandling() {
        if (isMobileDevice()) {
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
            }, 5000);
        }
    }

    document.addEventListener('contextmenu', event => event.preventDefault());

    function titleTypingEffect() {
        const titles = ["@cursive"];
        let currentIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentTitle = titles[currentIndex];

            if (isDeleting) {
                charIndex--;
                document.title = currentTitle.substring(0, charIndex) || "@";
            } else {
                charIndex++;
                document.title = currentTitle.substring(0, charIndex);
            }

            let typeSpeed = isDeleting ? 150 : 200;

            if (!isDeleting && charIndex >= currentTitle.length) {
                typeSpeed = 900;
                isDeleting = true;
            } else if (isDeleting && charIndex <= 0) {
                isDeleting = false;
                charIndex = 0;
                currentIndex = (currentIndex + 1) % titles.length;
                typeSpeed = 200;
            }

            setTimeout(type, typeSpeed);
        }

        type();
    }

    titleTypingEffect();
});

