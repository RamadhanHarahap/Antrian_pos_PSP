document.addEventListener('DOMContentLoaded', function() {
    if (document.body.classList.contains('index-page')) {
        initIndexPage();
    } else if (document.body.classList.contains('admin-page')) {
        initAdminPage();
    } else if (document.body.classList.contains('pasien-page')) {
        initPasienPage();
    } else if (document.body.classList.contains('login-page')) {
        initLoginPage();
    }
});

// ======================================
// Fungsionalitas Umum & Utilitas
// ======================================
function updateDateTime(timeId, dateId) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const dateString = `${day}, ${date} ${month} ${year}`;
    
    const timeElement = document.getElementById(timeId);
    if (timeElement) timeElement.textContent = timeString;

    const dateElement = document.getElementById(dateId);
    if (dateElement) dateElement.textContent = dateString;
}

function loadSettings() {
    const instansiNama = localStorage.getItem('instansiNama') || 'Kantor Pos Padangsidimpuan';
    const runningText = localStorage.getItem('runningText') || 'Selamat datang di Kantor Pos Padangsidimpuan. Silakan ambil nomor antrian Anda sesuai keperluan Anda.';
    
    const instansiElements = document.querySelectorAll('#instansi-nama, #admin-instansi-nama, #pasien-instansi-nama');
    instansiElements.forEach(el => el.textContent = instansiNama);

    const runningTextElement = document.getElementById('running-text');
    if (runningTextElement) runningTextElement.textContent = runningText;
}

// Menonaktifkan fitur suara untuk sementara
// function speakText(text) {
//     if ('speechSynthesis' in window) {
//         const speech = new SpeechSynthesisUtterance();
//         speech.lang = 'id-ID';
//         speech.text = text;
//         speech.volume = 1;
//         speech.rate = 1.1;
//         speech.pitch = 1.1;
//         window.speechSynthesis.speak(speech);
//     } else {
//         console.warn('Web Speech API is not supported in this browser.');
//     }
// }

// ======================================
// Fungsionalitas Halaman Index
// ======================================
let slideshowInterval;
let currentSlide = 0;

function initIndexPage() {
    updateDateTime('current-time', 'current-date');
    setInterval(() => updateDateTime('current-time', 'current-date'), 1000);
    loadSettings();
    initializeSlideshow();
    loadQueueData();
    setupWebSocket();
}

function initializeSlideshow() {
    const slideshowContainer = document.getElementById('slideshow');
    const dotsContainer = document.getElementById('dots-container');
    
    // Ini adalah bagian yang paling penting! Gunakan URL publik, bukan jalur lokal.
    let slides = JSON.parse(localStorage.getItem('slides')) || [
        { src: 'https://i.ibb.co/6PqjXWc/pos-slide-1.jpg' },
        { src: 'https://i.ibb.co/tCg3X3B/pos-slide-2.jpg' },
        { src: 'https://i.ibb.co/p3tJ5P0/pos-slide-3.jpg' }
    ];
    
    if (slideshowContainer) slideshowContainer.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';
    
    slides.forEach((slide, index) => {
        const slideElement = document.createElement('img');
        slideElement.src = slide.src;
        slideElement.className = 'slide';
        if (index === 0) slideElement.classList.add('active');
        slideElement.alt = `Slide ${index + 1}`;
        if (slideshowContainer) slideshowContainer.appendChild(slideElement);
        
        const dotElement = document.createElement('div');
        dotElement.className = 'dot';
        if (index === 0) dotElement.classList.add('active');
        dotElement.addEventListener('click', () => goToSlide(index));
        if (dotsContainer) dotsContainer.appendChild(dotElement);
    });
    
    if (slides.length > 1) {
        startSlideshow();
    }
}

function startSlideshow() {
    clearInterval(slideshowInterval);
    slideshowInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = (currentSlide + 1) % slides.length;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function goToSlide(index) {
    clearInterval(slideshowInterval);
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    
    startSlideshow();
}

function loadQueueData() {
    const currentQueue = localStorage.getItem('currentQueue') || '-';
    const queueNote = localStorage.getItem('queueNote') || 'Silakan menuju loket yang tersedia.';
    
    const currentQueueNumberElement = document.getElementById('current-queue-number');
    if (currentQueueNumberElement) currentQueueNumberElement.textContent = currentQueue;
    
    const queueNoteElement = document.getElementById('queue-note');
    if (queueNoteElement) queueNoteElement.textContent = queueNote;
    
    const queueList = JSON.parse(localStorage.getItem('queueList')) || [];
    for (let i = 0; i < 9; i++) {
        const queueItem = document.getElementById(`queue-next-${i + 1}`);
        if (queueItem) {
            queueItem.textContent = queueList[i] || '-';
        }
    }
}

function setupWebSocket() {
    window.addEventListener('storage', function(e) {
        if (e.key === 'currentQueue' || e.key === 'queueList' || e.key === 'queueNote') {
            loadQueueData();
        } else if (e.key === 'instansiNama' || e.key === 'runningText') {
            loadSettings();
        } else if (e.key === 'slides') {
            clearInterval(slideshowInterval);
            initializeSlideshow();
        }
    });
}

// Menonaktifkan fungsi panggilan suara sementara
// function callQueueNumber(number) {
//     const audio = document.getElementById('audio-notif');
//     const numberElement = document.getElementById('current-queue-number');
    
//     if (numberElement) {
//         numberElement.classList.add('blink');
//     }

//     if (audio) {
//         audio.play().then(() => {
//             setTimeout(() => {
//                 speakText(`Nomor antrian ${number}. Silakan menuju loket.`);
//                 if (numberElement) {
//                     numberElement.classList.remove('blink');
//                 }
//             }, 1000);
//         }).catch(e => console.error("Error playing audio:", e));
//     }
// }

// ======================================
// Fungsionalitas Halaman Pasien
// ======================================
function initPasienPage() {
    updateDateTime('pasien-current-time', 'pasien-current-date');
    setInterval(() => updateDateTime('pasien-current-time', 'pasien-current-date'), 1000);
    loadSettings();
    document.getElementById('take-queue-btn').addEventListener('click', takeQueueNumber);
    document.getElementById('close-result-btn').addEventListener('click', closeResult);
    document.getElementById('print-ticket-btn').addEventListener('click', printTicket);
}

function takeQueueNumber() {
    let queueList = JSON.parse(localStorage.getItem('queueList')) || [];
    let nextNumber = parseInt(localStorage.getItem('nextNumber') || '1');
    
    const newQueueNumber = `A${String(nextNumber).padStart(3, '0')}`;
    queueList.push(newQueueNumber);
    
    localStorage.setItem('queueList', JSON.stringify(queueList));
    localStorage.setItem('nextNumber', nextNumber + 1);
    
    const resultNumberElement = document.getElementById('result-number');
    if (resultNumberElement) resultNumberElement.textContent = newQueueNumber;

    const queueResultElement = document.getElementById('queue-result');
    if (queueResultElement) queueResultElement.classList.remove('hidden');

    // Menonaktifkan fitur suara sementara
    // speakText(`Anda mendapatkan nomor antrian ${newQueueNumber}. Silakan menunggu. Terima kasih.`);
}

function closeResult() {
    const queueResultElement = document.getElementById('queue-result');
    if (queueResultElement) queueResultElement.classList.add('hidden');
}

function printTicket() {
    const queueNumber = document.getElementById('result-number').textContent;
    const instansiNama = document.getElementById('pasien-instansi-nama').textContent;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <html>
            <head>
                <title>Tiket Antrian</title>
                <style>
                    body { font-family: 'Poppins', Arial, sans-serif; text-align: center; padding: 20px; }
                    .ticket { border: 1px dashed #000; padding: 20px; width: 250px; margin: 0 auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px; }
                    .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                    .number { font-size: 60px; font-weight: bold; margin: 20px 0; color: #FF6600; }
                    .info { font-size: 14px; margin-top: 20px; }
                    @media print { body { font-size: 10px; } .ticket { border: 1px solid #000; box-shadow: none; border-radius: 0; } }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="title">${instansiNama}</div>
                    <div>NOMOR ANTRIAN</div>
                    <div class="number">${queueNumber}</div>
                    <div class="info">
                        ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        <br>
                        ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div class="info" style="font-size:12px; margin-top:10px;">Mohon menunggu hingga dipanggil.</div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

// ======================================
// Fungsionalitas Halaman Admin & Login
// ======================================

let completedQueue = parseInt(localStorage.getItem('completedQueue') || '0');

function initLoginPage() {
    document.getElementById('admin-login-form').addEventListener('submit', handleLogin);
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('isAuthenticated', 'true');
        window.location.href = 'admin.html';
    } else {
        errorMessage.textContent = 'Username atau password salah.';
    }
}

function initAdminPage() {
    updateDateTime('admin-current-time', 'admin-current-date');
    setInterval(() => updateDateTime('admin-current-time', 'admin-current-date'), 1000);
    loadSettings();
    displayAdminQueueData();
    setupAdminEventListeners();
}

function displayAdminQueueData() {
    const queueList = JSON.parse(localStorage.getItem('queueList')) || [];
    const currentQueue = localStorage.getItem('currentQueue') || '-';
    
    const adminCurrentQueueElement = document.getElementById('admin-current-queue');
    if (adminCurrentQueueElement) adminCurrentQueueElement.textContent = currentQueue;
    
    const adminTotalQueueElement = document.getElementById('admin-total-queue');
    if (adminTotalQueueElement) adminTotalQueueElement.textContent = queueList.length;
    
    const adminCompletedQueueElement = document.getElementById('admin-completed-queue');
    if (adminCompletedQueueElement) adminCompletedQueueElement.textContent = completedQueue;

    const nextQueueListElement = document.getElementById('next-queue-list');
    if (nextQueueListElement) {
        nextQueueListElement.innerHTML = '';
        const displayQueue = queueList.slice(0, 5);
        displayQueue.forEach(number => {
            const li = document.createElement('li');
            li.textContent = number;
            nextQueueListElement.appendChild(li);
        });
    }
}

function setupAdminEventListeners() {
    document.getElementById('call-btn').addEventListener('click', callNextQueue);
    document.getElementById('recall-btn').addEventListener('click', recallCurrentQueue);
    document.getElementById('complete-btn').addEventListener('click', completeCurrentQueue);
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
    document.getElementById('add-slide-btn').addEventListener('click', addSlide);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn));
    });
    
    renderSlideshowAdmin();
}

function callNextQueue() {
    let queueList = JSON.parse(localStorage.getItem('queueList')) || [];
    if (queueList.length > 0) {
        const nextInLine = queueList.shift();
        localStorage.setItem('currentQueue', nextInLine);
        localStorage.setItem('queueList', JSON.stringify(queueList));
        displayAdminQueueData();
    }
}

function recallCurrentQueue() {
    const currentQueue = localStorage.getItem('currentQueue');
    if (currentQueue && currentQueue !== '-') {
        localStorage.setItem('currentQueue', currentQueue); 
        displayAdminQueueData();
    }
}

function completeCurrentQueue() {
    const currentQueue = localStorage.getItem('currentQueue');
    if (currentQueue && currentQueue !== '-') {
        completedQueue++;
        localStorage.setItem('completedQueue', completedQueue);
        localStorage.setItem('currentQueue', '-');
        displayAdminQueueData();
    }
}

function saveSettings() {
    const newInstansiNama = document.getElementById('instansi-nama-input').value;
    const newRunningText = document.getElementById('running-text-input').value;

    localStorage.setItem('instansiNama', newInstansiNama);
    localStorage.setItem('runningText', newRunningText);

    loadSettings();
    alert('Pengaturan berhasil disimpan!');
}

function addSlide() {
    const slideUrl = document.getElementById('new-slide-url').value;
    if (slideUrl) {
        let slides = JSON.parse(localStorage.getItem('slides')) || [];
        slides.push({ src: slideUrl });
        localStorage.setItem('slides', JSON.stringify(slides));
        document.getElementById('new-slide-url').value = '';
        renderSlideshowAdmin();
        alert('Slide berhasil ditambahkan!');
    } else {
        alert('URL slide tidak boleh kosong.');
    }
}

function renderSlideshowAdmin() {
    const slideshowList = document.getElementById('slideshow-list');
    if (!slideshowList) return;
    slideshowList.innerHTML = '';
    let slides = JSON.parse(localStorage.getItem('slides')) || [];

    slides.forEach((slide, index) => {
        const item = document.createElement('div');
        item.className = 'slideshow-item';
        item.innerHTML = `
            <img src="${slide.src}" alt="Slide ${index + 1}">
            <div class="slideshow-item-overlay">
                <div class="slideshow-item-actions">
                    <button class="slide-action-btn delete-slide-btn" data-index="${index}">&#x2715;</button>
                </div>
            </div>
        `;
        slideshowList.appendChild(item);
    });

    document.querySelectorAll('.delete-slide-btn').forEach(btn => {
        btn.addEventListener('click', deleteSlide);
    });
}

function deleteSlide(event) {
    const indexToDelete = event.target.dataset.index;
    let slides = JSON.parse(localStorage.getItem('slides')) || [];
    slides.splice(indexToDelete, 1);
    localStorage.setItem('slides', JSON.stringify(slides));
    renderSlideshowAdmin();
}

function handleLogout() {
    localStorage.removeItem('isAuthenticated');
    window.location.href = 'admin_login.html';
}

function switchTab(button) {
    const tabId = button.getAttribute('data-tab');
    document.querySelectorAll('.sidebar-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
    const sectionToActivate = document.getElementById(tabId);
    if (sectionToActivate) sectionToActivate.classList.add('active');
}