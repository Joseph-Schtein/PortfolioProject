document.addEventListener("DOMContentLoaded", () => {
    // 1. Elements
    const bootScreen = document.getElementById('boot-screen');
    const bootBtn = document.getElementById('boot-btn');
    const navBar = document.getElementById('sys-nav');
    const navBtns = document.querySelectorAll('.nav-btn');
    
    // 2. Audio Setup 
    const clickAudio = new Audio('click.mp3');
    clickAudio.volume = 0.2; 

    // 3. Database to store the original HTML for all 3 pages
    const sectionIds = ['bio', 'interests', 'cv'];
    const sectionData = {};
    let currentRunId = 0; // Prevents typing overlaps if user clicks tabs quickly

    sectionIds.forEach(id => {
        const sec = document.getElementById(id);
        const elementsToType = sec.querySelectorAll('.sys-out, .term-link');
        
        sectionData[id] = [];
        elementsToType.forEach(el => {
            sectionData[id].push({ element: el, html: el.innerHTML });
            el.innerHTML = ''; // Clear everything initially
        });
    });

    // 4. Typewriter Function (Now with a Kill Switch via myRunId)
    function typeWriterHTML(el, htmlString, speed, myRunId) {
        return new Promise(resolve => {
            let i = 0;
            let isTag = false;
            let currentHTML = "";

            function type() {
                // KILL SWITCH: If user clicked a different tab, abort this typing loop!
                if (currentRunId !== myRunId) return resolve(); 

                if (i < htmlString.length) {
                    let char = htmlString.charAt(i);
                    
                    if (char === '<') isTag = true;
                    currentHTML += char;
                    if (char === '>') isTag = false;

                    el.innerHTML = currentHTML;
                    i++;

                    // Play Audio
                    if (!isTag && char !== ' ') {
                        if (Math.random() > 0.3) {
                            let soundClone = clickAudio.cloneNode(); 
                            soundClone.play().catch(e => {}); 
                            setTimeout(() => {
                                soundClone.pause();
                                soundClone = null; 
                            }, 40); 
                        }
                    }

                    if (isTag) {
                        type();
                    } else {
                        const randomSpeed = Math.floor(Math.random() * (speed + 10)) + Math.max(1, speed - 5);
                        setTimeout(type, randomSpeed);
                    }
                } else {
                    resolve(); 
                }
            }
            type(); 
        });
    }

    // 5. The Command Executor (Switches Pages)
    async function executeCommand(targetId) {
        // Increment Run ID to stop any previous typing sequences
        currentRunId++;
        const myRunId = currentRunId;

        // Hide all sections and remove active class from buttons
        sectionIds.forEach(id => document.getElementById(id).classList.add('hidden'));
        navBtns.forEach(btn => btn.classList.remove('active'));

        // Show the target section and highlight the button
        document.getElementById(targetId).classList.remove('hidden');
        document.querySelector(`[data-target="${targetId}"]`).classList.add('active');

        // Clear the text in the target section to prepare for new typing
        sectionData[targetId].forEach(data => data.element.innerHTML = '');

        // Hide all cursors
        document.querySelectorAll('.cursor').forEach(c => c.style.visibility = 'hidden');

        // Type out the target section sequentially
        for (let i = 0; i < sectionData[targetId].length; i++) {
            if (currentRunId !== myRunId) break; // Abort if user clicked away
            
            const data = sectionData[targetId][i];
            let speed = 10; 
            if (data.element.tagName === 'H1') speed = 30; // Name types a bit slower
            
            await typeWriterHTML(data.element, data.html, speed, myRunId);
        }

        // Activate the blinking cursor at the bottom of the newly typed page
        if (currentRunId === myRunId) {
            const activeSection = document.getElementById(targetId);
            const activeCursor = activeSection.querySelector('.cursor');
            if (activeCursor) {
                activeCursor.style.visibility = 'visible';
                setInterval(() => {
                    activeCursor.style.opacity = (activeCursor.style.opacity == 0 ? 1 : 0);
                }, 500);
            }
        }
    }

    // 6. Event Listeners
    // Handle Boot Button
    bootBtn.addEventListener('click', async () => {
        bootScreen.classList.add('hidden');
        navBar.classList.remove('hidden'); // Reveal the nav bar
        await new Promise(r => setTimeout(r, 600));
        executeCommand('bio'); // Boot up page 1
    });

    // Handle Navigation Buttons
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-target');
            executeCommand(targetId);
        });
    });
});