// ===== KONSTANTA =====
const EMISI_MOBIL_PER_MENIT = 2.4;
const EMISI_MOTOR_PER_MENIT = 0.9;
const LAJU_MOBIL_DASAR = EMISI_MOBIL_PER_MENIT / 60;
const LAJU_MOTOR_DASAR = EMISI_MOTOR_PER_MENIT / 60;

let chart = null;
let historyChart = null;
let historyData = [];

const dataITS = {
    jamin_ginting: { nama: "Jamin Ginting - Iskandar Muda", mobil: 22, motor: 38, keterangan: "Persimpangan utama menuju kampus ITS" },
    gatot_subroto: { nama: "Gatot Subroto - Iskandar Muda", mobil: 18, motor: 30, keterangan: "Lalu lintas sedang" },
    iskandar_lubis: { nama: "Iskandar Muda - Abdullah Lubis", mobil: 14, motor: 25, keterangan: "Dekat pasar tradisional" },
    yamin_william: { nama: "HM. Yamin - William Iskandar", mobil: 12, motor: 20, keterangan: "Area pendidikan" },
    katamso_anidrus: { nama: "Katamso - Ani Idrus", mobil: 16, motor: 28, keterangan: "Dekat rumah sakit" },
    sutomo_yamin: { nama: "Sutomo - Yamin", mobil: 10, motor: 18, keterangan: "Lalu lintas ringan" },
    perintis_sutomo: { nama: "Perintis Kemerdekaan - Sutomo", mobil: 25, motor: 42, keterangan: "Persimpangan tersibuk" }
};

function hitungLajuEmisi(mobil, motor) {
    return (mobil * LAJU_MOBIL_DASAR) + (motor * LAJU_MOTOR_DASAR);
}

// LEFT RIEMANN SUM
function hitungAkumulasiEmisiRiemann(mobil, motor, waktuDetik) {
    let dt = 1;
    let n = waktuDetik;
    let total = 0;
    let dataWaktu = [];
    let dataLaju = [];
    let dataAkumulasi = [];
    let akumulasi = 0;
    for (let i = 0; i <= n; i++) {
        let t = i * dt;
        let laju = hitungLajuEmisi(mobil, motor);
        if (i < n) {
            total += laju * dt;
            akumulasi = total;
        }
        dataWaktu.push(t);
        dataLaju.push(parseFloat(laju.toFixed(4)));
        dataAkumulasi.push(parseFloat(akumulasi.toFixed(2)));
    }
    return { dataWaktu, dataLaju, dataAkumulasi, totalEmisi: total };
}

function updateGrafikKurva(waktuArray, lajuArray, akumulasiArray, totalEmisi, waktuDetik, mobil, motor) {
    const ctx = document.getElementById('emisiChart').getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: waktuArray,
            datasets: [
                { label: '🔴 Akumulasi Emisi CO₂ (gram)', data: akumulasiArray, borderColor: '#dc2626', backgroundColor: 'rgba(220,38,38,0.1)', borderWidth: 3, fill: true, tension: 0.1, pointRadius: 0, yAxisID: 'y' },
                { label: '🔵 Laju Emisi CO₂ (gram/detik)', data: lajuArray, borderColor: '#3b82f6', borderWidth: 2.5, fill: false, tension: 0.1, pointRadius: 0, yAxisID: 'y1' }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'nearest', intersect: true },
            plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)}` } }, legend: { position: 'top' } },
            scales: { x: { title: { display: true, text: 'Waktu (detik)' }, ticks: { stepSize: 10 } }, y: { title: { display: true, text: 'Akumulasi (gram)', color: '#dc2626' }, position: 'left' }, y1: { title: { display: true, text: 'Laju (gram/detik)', color: '#3b82f6' }, position: 'right', grid: { drawOnChartArea: false } } }
        }
    });
    let lokasiTerpilih = document.getElementById('lokasi').options[document.getElementById('lokasi').selectedIndex]?.text || 'Tidak dipilih';
    document.getElementById('integralInfo').innerHTML = `
        <p><strong>∫₀^${waktuDetik} r(t) dt ≈ Σ r(t_i)·1 = ${totalEmisi.toFixed(2)} gram</strong> (Metode Left Riemann Sum, Δt=1 detik)</p>
        <p>📍 ${lokasiTerpilih} | 🚗 ${mobil} mobil | 🏍️ ${motor} motor | ⏱️ ${waktuDetik} detik</p>
        <p class="rumus-note">✨ Karena r(t) konstan, hasil Riemann sama dengan integral analitik (r × T).</p>
    `;
}

function updateHistoryChart() {
    const ctx = document.getElementById('historyChart').getContext('2d');
    if (historyChart) historyChart.destroy();
    if (historyData.length === 0) {
        historyChart = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Riwayat Emisi', data: [], borderColor: '#f59e0b', backgroundColor: '#f59e0b', borderWidth: 2, pointRadius: 6, pointHoverRadius: 8, showLine: true, fill: false }] },
            options: { responsive: true, plugins: { tooltip: { callbacks: { label: (ctx) => `Emisi: ${ctx.raw} gram` } } }, scales: { x: { title: { display: true, text: 'Waktu Perhitungan' } }, y: { title: { display: true, text: 'Total Emisi (gram)' }, beginAtZero: true } } }
        });
        return;
    }
    let sorted = [...historyData].reverse();
    let labels = sorted.map(item => item.waktuLabel);
    let emisiValues = sorted.map(item => item.totalEmisi);
    historyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Emisi CO₂ (gram)',
                data: emisiValues,
                borderColor: '#f59e0b',
                backgroundColor: '#f59e0b',
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 9,
                pointBackgroundColor: '#f59e0b',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                showLine: true,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: { tooltip: { callbacks: { label: (ctx) => `Emisi: ${ctx.raw.toFixed(2)} gram` } }, legend: { position: 'top' } },
            scales: { x: { title: { display: true, text: 'Waktu Perhitungan' }, ticks: { maxRotation: 45, minRotation: 45 } }, y: { title: { display: true, text: 'Total Emisi (gram)' }, beginAtZero: true } }
        }
    });
}

function updateRekomendasiDinamis(totalEmisi, mobil, motor, waktu) {
    let pesan = '';
    if (totalEmisi <= 50) pesan = '✅ Emisi rendah! Pertahankan kebiasaan baik ini.';
    else if (totalEmisi <= 100) pesan = '⚠️ Emisi sedang. Coba matikan mesin jika menunggu >30 detik.';
    else if (totalEmisi <= 150) pesan = '🌫️ Emisi tinggi! Pertimbangkan carpool atau transportasi umum.';
    else pesan = '🔴 Emisi sangat tinggi! Segera beralih ke kendaraan listrik.';
    document.getElementById('rekomendasiDinamis').innerHTML = `
        <p><strong>Berdasarkan hitungan terakhir:</strong></p>
        <p>🚗 ${mobil} mobil + 🏍️ ${motor} motor selama ${waktu} detik = ${totalEmisi.toFixed(2)} gram CO₂</p>
        <p>${pesan}</p>
        <p style="margin-top:10px;">💡 Tips: Matikan mesin saat menunggu >30 detik dapat mengurangi emisi hingga 50%!</p>
    `;
}

function getLevel(totalEmisi) {
    if (totalEmisi <= 50) return 'Rendah';
    if (totalEmisi <= 100) return 'Sedang';
    if (totalEmisi <= 150) return 'Tinggi';
    return 'Ekstrem';
}

function addToHistory(lokasiNama, mobil, motor, waktu, totalEmisi) {
    const now = new Date();
    const waktuLabel = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' ' + now.toLocaleDateString('id-ID');
    const level = getLevel(totalEmisi);
    historyData.unshift({ waktuLabel, lokasi: lokasiNama, mobil, motor, durasi: waktu, totalEmisi, level });
    if (historyData.length > 20) historyData.pop();
    updateHistoryTable();
    updateHistoryChart();
}

function updateHistoryTable() {
    const tbody = document.getElementById('historyBody');
    if (!tbody) return;
    if (historyData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Belum ada data. Hitung emisi terlebih dahulu.</td></tr>';
        return;
    }
    tbody.innerHTML = historyData.map(item => {
        let levelClass = item.level === 'Rendah' ? 'level-rendah' : (item.level === 'Sedang' ? 'level-sedang' : (item.level === 'Tinggi' ? 'level-tinggi' : 'level-ekstrem'));
        return `<tr>
                    <td>${item.waktuLabel}</td>
                    <td>${item.lokasi}</td>
                    <td>${item.mobil}</td>
                    <td>${item.motor}</td>
                    <td>${item.durasi} dtk</td>
                    <td>${item.totalEmisi.toFixed(2)} g</td>
                    <td class="${levelClass}">${item.level}</td>
                </tr>`;
    }).join('');
}

function clearHistory() {
    if (confirm('Hapus semua riwayat?')) {
        historyData = [];
        updateHistoryTable();
        updateHistoryChart();
        document.getElementById('rekomendasiDinamis').innerHTML = '<p>👈 Belum ada data. Hitung emisi di menu Analisis terlebih dahulu.</p>';
    }
}

function hitungEmisi() {
    let mobil = parseInt(document.getElementById('mobil').value) || 0;
    let motor = parseInt(document.getElementById('motor').value) || 0;
    let waktuDetik = parseInt(document.getElementById('waktu').value) || 90;
    if (mobil < 0) mobil = 0;
    if (motor < 0) motor = 0;
    if (waktuDetik < 1) waktuDetik = 1;
    
    let { dataWaktu, dataLaju, dataAkumulasi, totalEmisi } = hitungAkumulasiEmisiRiemann(mobil, motor, waktuDetik);
    let totalLajuDasar = (mobil * LAJU_MOBIL_DASAR) + (motor * LAJU_MOTOR_DASAR);
    let proporsiMobil = totalLajuDasar > 0 ? (mobil * LAJU_MOBIL_DASAR) / totalLajuDasar : 0;
    let emisiMobilGram = totalEmisi * proporsiMobil;
    let emisiMotorGram = totalEmisi * (1 - proporsiMobil);
    
    document.getElementById('totalEmisi').innerHTML = totalEmisi.toFixed(2);
    document.getElementById('emisiMobil').innerHTML = emisiMobilGram.toFixed(2);
    document.getElementById('emisiMotor').innerHTML = emisiMotorGram.toFixed(2);
    document.getElementById('perSiklus').innerHTML = (totalEmisi / 1000).toFixed(4);
    document.getElementById('perJam').innerHTML = ((totalEmisi / 1000) * 20).toFixed(3);
    
    updateGrafikKurva(dataWaktu, dataLaju, dataAkumulasi, totalEmisi, waktuDetik, mobil, motor);
    
    let lokasiSelect = document.getElementById('lokasi');
    let lokasiNama = lokasiSelect.options[lokasiSelect.selectedIndex]?.text || 'Tidak dipilih';
    if (mobil > 0 || motor > 0) addToHistory(lokasiNama, mobil, motor, waktuDetik, totalEmisi);
    updateRekomendasiDinamis(totalEmisi, mobil, motor, waktuDetik);
    
    let lajuParsial = (1/(waktuDetik + 2)) + (1/(waktuDetik + 3));
    document.getElementById('lajuAkumulasi').innerHTML = lajuParsial.toFixed(4);
    document.getElementById('tValue').innerHTML = waktuDetik;
    
    const btn = document.querySelector('.btn-hitung');
    btn.style.transform = 'scale(0.97)';
    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
}

function initLokasiListener() {
    const lokasiSelect = document.getElementById('lokasi');
    const lokasiInfoDiv = document.getElementById('lokasiInfo');
    lokasiSelect.addEventListener('change', function() {
        let lokasiId = this.value;
        if (!lokasiId || !dataITS[lokasiId]) { lokasiInfoDiv.style.display = 'none'; return; }
        let data = dataITS[lokasiId];
        lokasiInfoDiv.style.display = 'block';
        lokasiInfoDiv.innerHTML = `<strong>📍 ${data.nama}</strong><br>${data.keterangan}<br>(Data referensi: ${data.mobil} mobil | ${data.motor} motor - silakan input manual)`;
    });
}

// ===== SCROLL SPY YANG LEBIH ANDAL =====
function initScrollSpy() {
    const sections = [
        { id: 'dashboard-section', btnTarget: 'dashboard' },
        { id: 'analisis-section', btnTarget: 'analisis' },
        { id: 'dampak-section', btnTarget: 'dampak' },
        { id: 'rekomendasi-section', btnTarget: 'rekomendasi' }
    ];
    const navBtns = document.querySelectorAll('.nav-scroll-btn');
    
    // Fungsi untuk menentukan section mana yang sedang aktif berdasarkan posisi scroll
    function updateActiveButton() {
        let currentSection = '';
        const scrollPosition = window.scrollY + 150; // offset untuk navigasi sticky
        
        for (let section of sections) {
            const element = document.getElementById(section.id);
            if (element) {
                const offsetTop = element.offsetTop;
                const offsetBottom = offsetTop + element.offsetHeight;
                if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
                    currentSection = section.btnTarget;
                    break;
                }
            }
        }
        
        // Jika tidak ada section yang terdeteksi, coba cari dari atas
        if (!currentSection && sections.length > 0) {
            const firstSection = document.getElementById(sections[0].id);
            if (firstSection && window.scrollY < firstSection.offsetTop) {
                currentSection = sections[0].btnTarget;
            }
        }
        
        // Update class active pada tombol
        navBtns.forEach(btn => {
            const target = btn.getAttribute('data-target');
            if (target === currentSection) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // Panggil saat scroll dan saat load
    window.addEventListener('scroll', updateActiveButton);
    window.addEventListener('load', updateActiveButton);
}

function smoothScrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.addEventListener('load', () => {
    document.getElementById('mobil').value = '';
    document.getElementById('motor').value = '';
    document.getElementById('waktu').value = 90;
    initLokasiListener();
    
    const navBtns = document.querySelectorAll('.nav-scroll-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            if (target === 'dashboard') smoothScrollToSection('dashboard-section');
            else if (target === 'analisis') smoothScrollToSection('analisis-section');
            else if (target === 'dampak') smoothScrollToSection('dampak-section');
            else if (target === 'rekomendasi') smoothScrollToSection('rekomendasi-section');
        });
    });
    
    const ctxKurva = document.getElementById('emisiChart').getContext('2d');
    chart = new Chart(ctxKurva, { type: 'line', data: { labels: [0], datasets: [] }, options: { responsive: true } });
    updateHistoryChart();
    document.getElementById('integralInfo').innerHTML = '<p>👈 Masukkan data lalu klik "Hitung Emisi CO₂"</p>';
    
    initScrollSpy();
});