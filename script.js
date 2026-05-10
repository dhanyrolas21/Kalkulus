// ======================================================================
//                         KONSTANTA DAN VARIABEL GLOBAL
// ======================================================================

// Konstanta emisi kendaraan (gram per menit)
const EMISI_MOBIL_PER_MENIT = 2.4;
const EMISI_MOTOR_PER_MENIT = 0.9;

// Konversi ke gram per detik
const LAJU_MOBIL_DASAR = EMISI_MOBIL_PER_MENIT / 60;   // 0.04 g/detik
const LAJU_MOTOR_DASAR = EMISI_MOTOR_PER_MENIT / 60;   // 0.015 g/detik

// Variabel untuk menyimpan instance chart
let chart = null;
let historyChart = null;
let emisiChart = null;
let peta = null;
let markersLayer = null;

// Array untuk menyimpan data riwayat perhitungan
let historyData = [];

// Data referensi untuk 8 lokasi ITS Medan
const dataITS = {
    jamin_ginting: {
        nama: "Jamin Ginting - Iskandar Muda",
        mobil: 15,
        motor: 32,
        lat: 3.5718,
        lng: 98.6670,
        keterangan: "Pertemuan arus kendaraan dari perumahan padat, pusat perbelanjaan, dan akses ke kawasan pendidikan"
    },
    gatot_subroto: {
        nama: "Gatot Subroto - Iskandar Muda",
        mobil: 17,
        motor: 30,
        lat: 3.5780,
        lng: 98.6580,
        keterangan: "Persimpangan dekat dengan area perkantoran dan pemukiman"
    },
    iskandar_lubis: {
        nama: "Iskandar Muda - Abdullah Lubis",
        mobil: 20,
        motor: 42,
        lat: 3.5820,
        lng: 98.6550,
        keterangan: "Aktivitas pasar tradisional dan sekolah di sekitar persimpangan"
    },
    yamin_william: {
        nama: "HM. Yamin - William Iskandar",
        mobil: 29,
        motor: 40,
        lat: 3.5690,
        lng: 98.6720,
        keterangan: "Berada di kawasan pendidikan dan perkantoran"
    },
    katamso_anidrus: {
        nama: "Katamso - Ani Idrus",
        mobil: 13,
        motor: 23,
        lat: 3.5850,
        lng: 98.6600,
        keterangan: "Persimpangan dekat rumah sakit dan pusat perbelanjaan"
    },
    sutomo_yamin: {
        nama: "Sutomo - Yamin",
        mobil: 14,
        motor: 25,
        lat: 3.5750,
        lng: 98.6650,
        keterangan: "Persimpangan yang menghubungkan Pemukiman dan perkantoran"
    },
    perintis_sutomo: {
        nama: "Perintis Kemerdekaan - Sutomo",
        mobil: 18,
        motor: 30,
        lat: 3.5650,
        lng: 98.6780,
        keterangan: "Menghubungkan beberapa kawasan pemukiman padat dan pusat kota"
    },
    kesawan_palang_merah: {
        nama: "Kesawan - Palang Merah",
        mobil: 25,
        motor: 40,
        lat: 3.5600,
        lng: 98.6820,
        keterangan: "Pertemuan arus kendaraan dari perumahan padat, pusat perbelanjaan, dan akses ke kawasan pendidikan"
    }
};

// Ambil elemen dropdown dan input
const lokasiSelect = document.getElementById('lokasi');
const mobilInput = document.getElementById('mobil');
const motorInput = document.getElementById('motor');

// Fungsi untuk mengisi input berdasarkan pilihan
function updateDataKendaraan() {
    const selectedKey = lokasiSelect.value;
    if (selectedKey && dataITS[selectedKey]) {
        mobilInput.value = dataITS[selectedKey].mobil;
        motorInput.value = dataITS[selectedKey].motor;
        console.log(`Data dimuat: ${dataITS[selectedKey].nama}`);
    } else {
        mobilInput.value = '';
        motorInput.value = '';
        console.warn('Lokasi tidak ditemukan:', selectedKey);
    }
}

// Pasang event listener saat dropdown berubah
lokasiSelect.addEventListener('change', updateDataKendaraan);

if (lokasiSelect.options.length > 0) {
    updateDataKendaraan();
}

// ======================================================================
//                         FUNGSI PERHITUNGAN DASAR
// ======================================================================

function hitungLajuEmisi(mobil, motor) {
    return (mobil * LAJU_MOBIL_DASAR) + (motor * LAJU_MOTOR_DASAR);
}

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

    return {
        dataWaktu: dataWaktu,
        dataLaju: dataLaju,
        dataAkumulasi: dataAkumulasi,
        totalEmisi: total
    };
}

// ======================================================================
//                         GRAFIK KURVA (LINE CHART) - ANALISIS
// ======================================================================

function updateGrafikKurva(waktuArray, lajuArray, akumulasiArray, totalEmisi, waktuDetik, mobil, motor) {
    const ctx = document.getElementById('emisiChart').getContext('2d');
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: waktuArray,
            datasets: [
                {
                    label: '🔴 Akumulasi Emisi CO₂ (gram)',
                    data: akumulasiArray,
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.1,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    yAxisID: 'y'
                },
                {
                    label: '🔵 Laju Emisi CO₂ (gram/detik)',
                    data: lajuArray,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.1,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: { mode: 'nearest', intersect: true },
            plugins: {
                tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)}` } },
                legend: { position: 'top' }
            },
            scales: {
                x: { title: { display: true, text: 'Waktu (detik)' }, ticks: { stepSize: 10 }, grid: { color: '#e0e0e0' } },
                y: { title: { display: true, text: 'Akumulasi (gram)', color: '#dc2626' }, position: 'left', beginAtZero: true },
                y1: { title: { display: true, text: 'Laju (gram/detik)', color: '#3b82f6' }, position: 'right', beginAtZero: true, grid: { drawOnChartArea: false } }
            }
        }
    });

    let lokasiTerpilih = lokasiSelect.options[lokasiSelect.selectedIndex]?.text || 'Tidak dipilih';
    
    document.getElementById('integralInfo').innerHTML = `
    <p><strong>∫₀^${waktuDetik} r(t) dt ≈ ∑_{i=0}^{${waktuDetik-1}} r(i) · Δt = ∑_{i=0}^{${waktuDetik-1}} r(i) · 1 = ${totalEmisi.toFixed(2)} gram</strong> (Metode Left Riemann Sum, Δt = 1 detik)</p>
    <p>📍 ${lokasiTerpilih} | 🚗 ${mobil} mobil | 🏍️ ${motor} motor | ⏱️ ${waktuDetik} detik</p>
    <p class="rumus-note">✨ Area biru di bawah kurva laju menunjukkan luas = total emisi.</p>
`;
}

// ======================================================================
//                         GRAFIK BATANG (BAR CHART) - DASHBOARD
// ======================================================================

function updateHistoryChart() {
    const ctx = document.getElementById('historyChart').getContext('2d');
    if (historyChart) historyChart.destroy();

    if (historyData.length === 0) {
        historyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Riwayat Emisi',
                    data: [],
                    backgroundColor: '#4ade80',
                    borderColor: '#22c55e',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `Emisi: ${ctx.raw} gram`
                        }
                    }
                },
                scales: {
                    x: { title: { display: true, text: 'Waktu Perhitungan' }, ticks: { maxRotation: 45 } },
                    y: { title: { display: true, text: 'Total Emisi (gram)' }, beginAtZero: true }
                }
            }
        });
        return;
    }

    let sorted = [...historyData].reverse();
    let labels = sorted.map(item => item.waktuLabel);
    let emisiValues = sorted.map(item => item.totalEmisi);

    historyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Emisi CO₂ (gram)',
                data: emisiValues,
                backgroundColor: '#4ade80',
                borderColor: '#22c55e',
                borderWidth: 1,
                borderRadius: 6,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `Emisi: ${ctx.raw.toFixed(2)} gram`
                    }
                },
                legend: { position: 'top' }
            },
            scales: {
                x: { title: { display: true, text: 'Waktu Perhitungan' }, ticks: { maxRotation: 45 } },
                y: { title: { display: true, text: 'Total Emisi (gram)' }, beginAtZero: true }
            }
        }
    });
}

// ======================================================================
//                         UPDATE INFO DASHBOARD
// ======================================================================

function updateDashboardInfo() {
    const infoDiv = document.getElementById('dashboardInfo');
    if (!infoDiv) return;

    if (historyData.length === 0) {
        infoDiv.innerHTML = '<p>👈 Belum ada perhitungan. Lakukan hitung emisi terlebih dahulu.</p>';
        return;
    }

    const last = historyData[0];
    infoDiv.innerHTML = `
        <div style="background: var(--surface-2); padding: 12px; border-radius: 12px; margin-top: 16px; text-align: center;">
            <strong>📍 Perhitungan terakhir:</strong> ${last.lokasi}<br>
            <strong>🕒 Waktu:</strong> ${last.waktuLabel}
        </div>
    `;
}

// ======================================================================
//                         REKOMENDASI DINAMIS
// ======================================================================

function updateRekomendasiDinamis(totalEmisi, mobil, motor, waktu) {
    let pesan = '';
    if (totalEmisi <= 50) {
        pesan = '✅ Emisi rendah! Pertahankan kebiasaan baik ini.';
    } else if (totalEmisi <= 100) {
        pesan = '⚠️ Emisi sedang. Coba matikan mesin jika menunggu >30 detik.';
    } else if (totalEmisi <= 150) {
        pesan = '🌫️ Emisi tinggi! Pertimbangkan carpool atau transportasi umum.';
    } else {
        pesan = '🔴 Emisi sangat tinggi! Segera beralih ke kendaraan listrik.';
    }

    document.getElementById('rekomendasiDinamis').innerHTML = `
        <p><strong>Berdasarkan hitungan terakhir:</strong></p>
        <p>🚗 ${mobil} mobil + 🏍️ ${motor} motor selama ${waktu} detik = ${totalEmisi.toFixed(2)} gram CO₂</p>
        <p>${pesan}</p>
        <p style="margin-top:10px;">💡 Tips: Matikan mesin saat menunggu >30 detik dapat mengurangi emisi hingga 50%!</p>
    `;
}

// ======================================================================
//                         FUNGSI HISTORY (TABEL)
// ======================================================================

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

    historyData.unshift({
        waktuLabel: waktuLabel,
        lokasi: lokasiNama,
        mobil: mobil,
        motor: motor,
        durasi: waktu,
        totalEmisi: totalEmisi,
        level: level
    });

    if (historyData.length > 20) historyData.pop();

    updateHistoryTable();
    updateHistoryChart();
    updateDashboardInfo();
}

function updateHistoryTable() {
    const tbody = document.getElementById('historyBody');
    if (!tbody) return;

    if (historyData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Belum ada data. Hitung emisi terlebih dahulu.</td></tr>';
        return;
    }

    let html = '';
    for (let item of historyData) {
        let levelClass = '';
        if (item.level === 'Rendah') levelClass = 'level-rendah';
        else if (item.level === 'Sedang') levelClass = 'level-sedang';
        else if (item.level === 'Tinggi') levelClass = 'level-tinggi';
        else if (item.level === 'Ekstrem') levelClass = 'level-ekstrem';

        html += `
            <tr>
                <td>${item.waktuLabel}</td>
                <td>${item.lokasi}</td>
                <td>${item.mobil}</td>
                <td>${item.motor}</td>
                <td>${item.durasi} dtk</td>
                <td>${item.totalEmisi.toFixed(2)} g</td>
                <td class="${levelClass}">${item.level}</td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}

function clearHistory() {
    if (confirm('Hapus semua riwayat?')) {
        historyData = [];
        updateHistoryTable();
        updateHistoryChart();
        updateDashboardInfo();
        document.getElementById('rekomendasiDinamis').innerHTML = '<p>👈 Belum ada data. Hitung emisi di menu Analisis terlebih dahulu.</p>';
    }
}

// ======================================================================
//                         FUNGSI UTAMA (HITUNG EMISI)
// ======================================================================

function hitungEmisi() {
    let mobil = parseInt(document.getElementById('mobil').value) || 0;
    let motor = parseInt(document.getElementById('motor').value) || 0;
    let waktuDetik = parseInt(document.getElementById('waktu').value) || 60;

    if (mobil < 0) mobil = 0;
    if (motor < 0) motor = 0;
    if (waktuDetik < 1) waktuDetik = 1;

    document.getElementById('mobil').value = mobil;
    document.getElementById('motor').value = motor;
    document.getElementById('waktu').value = waktuDetik;

    let { dataWaktu, dataLaju, dataAkumulasi, totalEmisi } = hitungAkumulasiEmisiRiemann(mobil, motor, waktuDetik);

    let totalLajuDasar = (mobil * LAJU_MOBIL_DASAR) + (motor * LAJU_MOTOR_DASAR);
    let proporsiMobil = totalLajuDasar > 0 ? (mobil * LAJU_MOBIL_DASAR) / totalLajuDasar : 0;
    let emisiMobilGram = totalEmisi * proporsiMobil;
    let emisiMotorGram = totalEmisi * (1 - proporsiMobil);

    document.getElementById('totalEmisi').innerHTML = totalEmisi.toFixed(2);
    document.getElementById('emisiMobil').innerHTML = emisiMobilGram.toFixed(2);
    document.getElementById('emisiMotor').innerHTML = emisiMotorGram.toFixed(2);
    document.getElementById('perSiklus').innerHTML = (totalEmisi / 1000).toFixed(4);
    
    updateGrafikKurva(dataWaktu, dataLaju, dataAkumulasi, totalEmisi, waktuDetik, mobil, motor);

    let lokasiNama = lokasiSelect.options[lokasiSelect.selectedIndex]?.text || 'Tidak dipilih';
    if (mobil > 0 || motor > 0) addToHistory(lokasiNama, mobil, motor, waktuDetik, totalEmisi);

    updateRekomendasiDinamis(totalEmisi, mobil, motor, waktuDetik);

    let lajuParsial = (1 / (waktuDetik + 2)) + (1 / (waktuDetik + 3));
    document.getElementById('lajuAkumulasi').innerHTML = lajuParsial.toFixed(4);
    document.getElementById('tValue').innerHTML = waktuDetik;

    // Update Live Chart
    renderEmisiChart(mobil, motor, waktuDetik);

    const btn = document.querySelector('.btn-primary');
    if (btn) {
        btn.style.transform = 'scale(0.98)';
        setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
    }
}

// ======================================================================
//                         DATA CONTOH & LOKASI INFO
// ======================================================================

function initDataContoh() {
    const btn = document.getElementById('btnDataContoh');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const lokasiId = lokasiSelect.value;
        if (!lokasiId || !dataITS[lokasiId]) {
            alert('Pilih lokasi terlebih dahulu!');
            return;
        }
        const data = dataITS[lokasiId];
        document.getElementById('mobil').value = data.mobil;
        document.getElementById('motor').value = data.motor;

        const infoDiv = document.getElementById('lokasiInfo');
        if (infoDiv) {
            infoDiv.style.display = 'block';
            infoDiv.innerHTML = `<i class="fas fa-check-circle"></i> Data contoh terisi! Mobil: ${data.mobil}, Motor: ${data.motor}. Anda masih bisa mengedit manual.`;
            setTimeout(() => { infoDiv.style.display = 'none'; }, 3000);
        }
    });
}

function initLokasiListener() {
    const lokasiInfoDiv = document.getElementById('lokasiInfo');

    lokasiSelect.addEventListener('change', function() {
        let lokasiId = this.value;
        if (!lokasiId || !dataITS[lokasiId]) {
            lokasiInfoDiv.style.display = 'none';
            return;
        }
        let data = dataITS[lokasiId];
        lokasiInfoDiv.style.display = 'block';
        lokasiInfoDiv.innerHTML = `<i class="fas fa-info-circle"></i> <strong>${data.nama}</strong><br>${data.keterangan}<br>(Data referensi: ${data.mobil} mobil | ${data.motor} motor - silakan input manual)`;
    });
}

// ======================================================================
//                         SCROLL SPY & BACK TO TOP
// ======================================================================

function initScrollSpy() {
    const sections = ['dashboard-section', 'peta-section', 'analisis-section', 'dampak-section', 'rekomendasi-section'];
    const navBtns = document.querySelectorAll('.nav-btn');

    function updateActiveButton() {
        let currentSection = '';
        const scrollPosition = window.scrollY + 120;

        for (let section of sections) {
            const el = document.getElementById(section);
            if (el && scrollPosition >= el.offsetTop && scrollPosition < el.offsetTop + el.offsetHeight) {
                currentSection = section.replace('-section', '');
                break;
            }
        }

        navBtns.forEach(btn => {
            const target = btn.getAttribute('data-target');
            if (target === currentSection) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    window.addEventListener('scroll', updateActiveButton);
    window.addEventListener('load', updateActiveButton);
}

function smoothScrollToSection(sectionId) {
    const section = document.getElementById(sectionId + '-section');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) btn.style.display = 'flex';
        else btn.style.display = 'none';
    });

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ======================================================================
//                         JAM REAL-TIME WIB
// ======================================================================

function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const clockElement = document.getElementById('liveClock');
    if (clockElement) {
        clockElement.innerText = `${hours}:${minutes}:${seconds} WIB`;
    }
}

setInterval(updateClock, 1000);
updateClock();

// ======================================================================
//                         DARK / LIGHT MODE TOGGLE
// ======================================================================

function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark');
        toggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark');
        toggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        if (historyData.length) updateHistoryChart();
        if (chart) { chart.destroy(); chart = null; }
        if (emisiChart) { emisiChart.destroy(); emisiChart = null; }
    });
}

// ======================================================================
//                    LIVE CHART INTERAKTIF (Emisi vs Waktu)
// ======================================================================

function hitungAkumulasiPerDetik(mobil, motor, durasi) {
    const lajuPerDetik = (mobil * LAJU_MOBIL_DASAR) + (motor * LAJU_MOTOR_DASAR);
    const akumulasi = [];
    for (let t = 0; t <= durasi; t++) {
        akumulasi.push(lajuPerDetik * t);
    }
    return akumulasi;
}

function renderEmisiChart(mobil, motor, durasi) {
    const canvas = document.getElementById('emisiVsWaktuChart');
    if (!canvas) {
        console.warn("Canvas emisiVsWaktuChart tidak ditemukan!");
        return;
    }

    const ctx = canvas.getContext('2d');
    const akumulasiEmisi = hitungAkumulasiPerDetik(mobil, motor, durasi);
    const labels = Array.from({ length: durasi + 1 }, (_, i) => i);
    
    const maxPoints = 100;
    const step = Math.ceil(durasi / maxPoints);
    const filteredLabels = labels.filter((_, i) => i % step === 0);
    const filteredData = akumulasiEmisi.filter((_, i) => i % step === 0);
    
    if (emisiChart) {
        emisiChart.destroy();
    }
    
    emisiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: filteredLabels,
            datasets: [{
                label: `Akumulasi CO₂ (gram)`,
                data: filteredData,
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.1,
                pointRadius: 3,
                pointHoverRadius: 7,
                pointBackgroundColor: '#e74c3c',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `CO₂: ${context.raw.toFixed(2)} gram`,
                        title: (context) => `Waktu: ${context[0].label} detik`
                    }
                },
                legend: { position: 'top' }
            },
            scales: {
                x: { title: { display: true, text: 'Waktu (detik)' }, grid: { display: false } },
                y: { title: { display: true, text: 'Total Emisi CO₂ (gram)' }, beginAtZero: true }
            }
        }
    });
}

function resetLiveChartZoom() {
    if (emisiChart && emisiChart.resetZoom) {
        emisiChart.resetZoom();
    }
}

function downloadLiveChartAsImage() {
    const canvas = document.getElementById('emisiVsWaktuChart');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'akumulasi_emisi_co2.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function initLiveChart() {
    const canvas = document.getElementById('emisiVsWaktuChart');
    if (!canvas) {
        console.log("Canvas emisiVsWaktuChart belum ada, lewati inisialisasi.");
        return;
    }
    
    const resetBtn = document.getElementById('resetZoomBtn');
    if (resetBtn) resetBtn.addEventListener('click', resetLiveChartZoom);
    
    const downloadBtn = document.getElementById('downloadChartBtn');
    if (downloadBtn) downloadBtn.addEventListener('click', downloadLiveChartAsImage);
    
    if (dataITS.kesawan_palang_merah) {
        renderEmisiChart(dataITS.kesawan_palang_merah.mobil, dataITS.kesawan_palang_merah.motor, 60);
    } else {
        renderEmisiChart(10, 15, 60);
    }
}

// ======================================================================
//                    PETA EMISI (LEAFLET MAP) - HEATMAP
// ======================================================================

function getWarnaByEmisi(emisi, maxEmisi) {
    const persentase = emisi / maxEmisi;
    if (persentase > 0.7) return '#e74c3c';
    if (persentase > 0.4) return '#f39c12';
    return '#27ae60';
}

function getRadiusByEmisi(emisi, maxEmisi) {
    const minRadius = 12;
    const maxRadius = 32;
    const normalized = Math.min(1, emisi / maxEmisi);
    return minRadius + (normalized * (maxRadius - minRadius));
}

function initPeta() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.warn("Container peta tidak ditemukan!");
        return;
    }
    
    peta = L.map('map').setView([3.5952, 98.6722], 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 11
    }).addTo(peta);
    
    markersLayer = L.layerGroup().addTo(peta);
    updatePetaMarkers();
    updatePetaLegenda();
}

function updatePetaMarkers() {
    if (!markersLayer) return;
    
    // Hapus semua marker yang ada
    markersLayer.clearLayers();
    
    const durasiDefault = 60;
    const lokasiKeys = Object.keys(dataITS);
    const hasilEmisi = {};
    let maxEmisi = 0;
    
    // Hitung emisi dan cari nilai maksimum
    lokasiKeys.forEach(key => {
        const lokasi = dataITS[key];
        const emisi = (lokasi.mobil * LAJU_MOBIL_DASAR + lokasi.motor * LAJU_MOTOR_DASAR) * durasiDefault;
        hasilEmisi[key] = emisi;
        if (emisi > maxEmisi) maxEmisi = emisi;
    });
    
    // Buat marker untuk setiap lokasi
    lokasiKeys.forEach(key => {
        const lokasi = dataITS[key];
        
        if (!lokasi.lat || !lokasi.lng) {
            console.warn(`⚠️ Lokasi ${key} tidak memiliki koordinat!`);
            return;
        }
        
        const emisi = hasilEmisi[key];
        const persentase = emisi / maxEmisi;
        
        // Tentukan warna berdasarkan persentase emisi
        let warnaMarker = "";
        let kategoriText = "";
        if (persentase > 0.7) {
            warnaMarker = "#e74c3c";  // Merah (Tinggi)
            kategoriText = "Tinggi";
        } else if (persentase > 0.4) {
            warnaMarker = "#f39c12";  // Kuning/Oranye (Sedang)
            kategoriText = "Sedang";
        } else {
            warnaMarker = "#2ecc71";  // Hijau (Rendah)
            kategoriText = "Rendah";
        }
        
        // Buat icon marker berbentuk PIN dari Font Awesome
        const pinIcon = L.divIcon({
            className: 'custom-pin-marker',
            html: `<i class="fas fa-map-marker-alt" style="font-size: 36px; color: ${warnaMarker}; text-shadow: 0 1px 3px rgba(0,0,0,0.3);"></i>`,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36],
            tooltipAnchor: [18, -36]
        });
        
        // Buat marker menggunakan pin icon
        const marker = L.marker([lokasi.lat, lokasi.lng], { icon: pinIcon }).addTo(markersLayer);
        
        // Tambahkan popup dengan informasi detail
        marker.bindPopup(`
            <div style="font-family: 'Poppins', sans-serif; min-width: 220px;">
                <strong><i class="fas fa-map-marker-alt" style="color: ${warnaMarker};"></i> ${lokasi.nama}</strong><br>
                <hr style="margin: 8px 0; border-color: #ddd;">
                🚗 Mobil: <strong>${lokasi.mobil}</strong><br>
                🏍️ Motor: <strong>${lokasi.motor}</strong><br>
                📊 Total Kendaraan: <strong>${lokasi.mobil + lokasi.motor}</strong><br>
                💨 CO₂ (60 detik): <strong>${emisi.toFixed(1)} gram</strong><br>
                <span style="color: ${warnaMarker}; font-weight: bold;">📌 Kategori: ${kategoriText}</span>
            </div>
        `);
        
        // Tambahkan tooltip (hover)
        marker.bindTooltip(`${lokasi.nama} - ${emisi.toFixed(0)}g CO₂ (${kategoriText})`, {
            sticky: true,
            offset: [0, -30]
        });
    });
    
    // Sesuaikan batas peta agar semua marker terlihat
    if (markersLayer.getLayers().length > 0) {
        const bounds = markersLayer.getBounds();
        if (bounds.isValid()) {
            peta.fitBounds(bounds, { padding: [50, 50] });
        }
    }
}

function updatePetaLegenda() {
    const legendaContainer = document.getElementById('peta-legenda-container');
    if (!legendaContainer) return;
    
    legendaContainer.innerHTML = `
        <div class="peta-legend">
            <div class="circle" style="background: #e74c3c;"></div>
            <span>🔴 Tinggi (>70% dari maksimum)</span>
        </div>
        <div class="peta-legend">
            <div class="circle" style="background: #f39c12;"></div>
            <span>🟠 Sedang (40-70% dari maksimum)</span>
        </div>
        <div class="peta-legend">
            <div class="circle" style="background: #27ae60;"></div>
            <span>🟢 Rendah (<40% dari maksimum)</span>
        </div>
        <div class="peta-legend">
            <span><i class="fas fa-info-circle"></i> ⚪ Ukuran lingkaran = besar emisi</span>
        </div>
    `;
}

function refreshPeta() {
    if (peta && markersLayer) {
        updatePetaMarkers();
        updatePetaLegenda();
    }
}

// ======================================================================
//                    FITUR PERBANDINGAN LOKASI (TABEL)
// ======================================================================

function renderPerbandinganLokasi() {
    const container = document.getElementById('tabel-perbandingan-container');
    if (!container) {
        console.warn("Container tabel perbandingan tidak ditemukan!");
        return;
    }

    const lokasiKeys = Object.keys(dataITS);
    const durasiDefault = 60;
    
    const hasilPerhitungan = lokasiKeys.map(key => {
        const lokasi = dataITS[key];
        const totalKendaraan = lokasi.mobil + lokasi.motor;
        const emisi = (lokasi.mobil * 0.04 + lokasi.motor * 0.015) * durasiDefault;
        
        return {
            key: key,
            nama: lokasi.nama,
            mobil: lokasi.mobil,
            motor: lokasi.motor,
            totalKendaraan: totalKendaraan,
            emisi: emisi
        };
    });
    
    hasilPerhitungan.sort((a, b) => b.emisi - a.emisi);
    
    const semuaEmisi = hasilPerhitungan.map(item => item.emisi);
    const maxEmisi = Math.max(...semuaEmisi);
    const minEmisi = Math.min(...semuaEmisi);
    const range = maxEmisi - minEmisi;
    const batasTinggi = maxEmisi - (range * 0.3);
    const batasRendah = minEmisi + (range * 0.3);
    
    hasilPerhitungan.forEach(item => {
        let kategori = "", warna = "";
        if (item.emisi >= batasTinggi) {
            kategori = "Tinggi";
            warna = "#e74c3c";
        } else if (item.emisi <= batasRendah) {
            kategori = "Rendah";
            warna = "#27ae60";
        } else {
            kategori = "Sedang";
            warna = "#f39c12";
        }
        item.kategori = kategori;
        item.warna = warna;
    });
    
    const tertinggi = hasilPerhitungan[0];
    const rataRata = semuaEmisi.reduce((sum, val) => sum + val, 0) / semuaEmisi.length;
    const totalEmisiGabungan = semuaEmisi.reduce((sum, val) => sum + val, 0);
    
    let tabelHTML = `
        <div style="overflow-x: auto;">
            <table class="perbandingan-table" style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background-color: #2c3e50; color: white;">
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">No</th>
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Lokasi</th>
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Mobil</th>
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Motor</th>
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Total Kendaraan</th>
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Estimasi CO₂ (gram)</th>
                        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">Kategori</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    hasilPerhitungan.forEach((item, index) => {
        tabelHTML += `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${index + 1}</td>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">${item.nama}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.mobil}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.motor}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.totalKendaraan}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; font-weight: bold;">${item.emisi.toFixed(1)} gram</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd; color: ${item.warna}; font-weight: bold;">
                    ${item.kategori === "Tinggi" ? "🔴" : item.kategori === "Sedang" ? "🟠" : "🟢"} ${item.kategori}
                </td>
            </tr>
        `;
    });
    
    tabelHTML += `
                </tbody>
            </table>
        </div>
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
            <h4>📌 Ringkasan:</h4>
            <ul style="margin: 10px 0 0 20px; line-height: 1.6;">
                <li>📍 Lokasi dengan emisi tertinggi: <strong>${tertinggi.nama}</strong> (${tertinggi.emisi.toFixed(1)} gram CO₂ per siklus)</li>
                <li>📊 Rata-rata emisi per lokasi: <strong>${rataRata.toFixed(1)} gram</strong></li>
                <li>🌍 Total emisi gabungan semua lokasi (per siklus): <strong>${totalEmisiGabungan.toFixed(1)} gram</strong> (≈ ${(totalEmisiGabungan / 1000).toFixed(2)} kg)</li>
            </ul>
            <p style="margin-top: 10px; font-size: 12px; color: #666;">
                ℹ️ Kategori ditentukan berdasarkan distribusi data: 30% tertinggi = 🔴 Tinggi, 30% terendah = 🟢 Rendah, sisanya = 🟠 Sedang.
            </p>
        </div>
    `;
    
    container.innerHTML = tabelHTML;
}

// ======================================================================
//                    ANALISIS MULTI-DURASI
// ======================================================================

function renderMultiDurasi() {
    const headerRow = document.getElementById('multidurasi-header');
    const bodyContainer = document.getElementById('multidurasi-body');
    
    if (!headerRow || !bodyContainer) {
        console.warn("Element tabel multi-durasi tidak ditemukan!");
        return;
    }
    
    // Daftar durasi yang akan dianalisis (dalam detik)
    const durasiList = [30, 60, 90, 120, 150];
    
    // Ambil semua lokasi dari dataITS
    const lokasiKeys = Object.keys(dataITS);
    const lokasiData = lokasiKeys.map(key => ({
        nama: dataITS[key].nama,
        mobil: dataITS[key].mobil,
        motor: dataITS[key].motor,
        key: key
    }));
    
    // Hitung emisi untuk setiap lokasi dan setiap durasi
    const hasilMatrix = [];
    const emisiPerDurasi = {};
    
    durasiList.forEach(durasi => {
        emisiPerDurasi[durasi] = [];
    });
    
    lokasiData.forEach(lokasi => {
        const baris = { nama: lokasi.nama };
        durasiList.forEach(durasi => {
            const emisi = (lokasi.mobil * LAJU_MOBIL_DASAR + lokasi.motor * LAJU_MOTOR_DASAR) * durasi;
            baris[durasi] = emisi;
            emisiPerDurasi[durasi].push(emisi);
        });
        hasilMatrix.push(baris);
    });
    
    // Tentukan batas warna untuk setiap durasi (persentil 30% dan 70%)
    const batasWarna = {};
    durasiList.forEach(durasi => {
        const values = [...emisiPerDurasi[durasi]].sort((a, b) => a - b);
        const index30 = Math.floor(values.length * 0.3);
        const index70 = Math.floor(values.length * 0.7);
        batasWarna[durasi] = {
            rendah: values[index30] || 0,
            tinggi: values[index70] || Infinity
        };
    });
    
    // Generate Header
    let headerHTML = `<tr><th>📍 Lokasi</th>`;
    durasiList.forEach(durasi => {
        headerHTML += `<th>${durasi} detik</th>`;
    });
    headerHTML += `</tr>`;
    headerRow.innerHTML = headerHTML;
    
    // Generate Body
    let bodyHTML = '';
    hasilMatrix.forEach(lokasi => {
        let rowHTML = `<tr><td><strong>${lokasi.nama}</strong></td>`;
        durasiList.forEach(durasi => {
            const emisi = lokasi[durasi];
            const batas = batasWarna[durasi];
            let kelas = '';
            if (emisi >= batas.tinggi) {
                kelas = 'cell-tinggi';
            } else if (emisi <= batas.rendah) {
                kelas = 'cell-rendah';
            } else {
                kelas = 'cell-sedang';
            }
            rowHTML += `<td class="${kelas}">${emisi.toFixed(1)} g</td>`;
        });
        rowHTML += `</tr>`;
        bodyHTML += rowHTML;
    });
    bodyContainer.innerHTML = bodyHTML;
}

// Panggil fungsi ini saat halaman dimuat
// Tambahkan ke DOMContentLoaded yang sudah ada
// Cari window.addEventListener('DOMContentLoaded', ...) dan tambahkan baris ini di dalamnya:
// renderMultiDurasi();

// ======================================================================
//                         INISIALISASI SAAT LOAD (SATU KALI)
// ======================================================================

window.addEventListener('DOMContentLoaded', function() {
    renderMultiDurasi();
    // Set default values
    document.getElementById('mobil').value = '';
    document.getElementById('motor').value = '';
    document.getElementById('waktu').value = 60;
    
    // Inisialisasi semua fitur
    initLokasiListener();
    initDataContoh();
    initScrollSpy();
    initBackToTop();
    initThemeToggle();
    renderPerbandinganLokasi();
    initLiveChart();
    initPeta();  // <-- PETA HEATMAP
    
    // Inisialisasi chart kosong untuk analisis
    const ctxKurva = document.getElementById('emisiChart');
    if (ctxKurva) {
        chart = new Chart(ctxKurva.getContext('2d'), {
            type: 'line',
            data: { labels: [0], datasets: [] },
            options: { responsive: true }
        });
    }
    
    // Update tampilan awal
    updateHistoryChart();
    updateDashboardInfo();
    
    const integralInfo = document.getElementById('integralInfo');
    if (integralInfo) {
        integralInfo.innerHTML = '<p>👈 Masukkan data lalu klik "Hitung Emisi CO₂"</p>';
    }
    
    // Event listener untuk navigasi
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            smoothScrollToSection(target);
        });
    });
});