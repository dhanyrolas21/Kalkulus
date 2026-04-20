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

// Array untuk menyimpan data riwayat perhitungan
let historyData = [];

// Data referensi untuk 7 lokasi ITS Medan (hanya untuk tombol "Gunakan Data Contoh")
const dataITS = {
    jamin_ginting: {
        nama: "Jamin Ginting - Iskandar Muda",
        mobil: 11,
        motor: 20,
        keterangan: "Pertemuan arus kendaraan dari perumahan padat, pusat perbelanjaan, dan akses ke kawasan pendidikan serta perkantoran"
    },
    gatot_subroto: {
        nama: "Gatot Subroto - Iskandar Muda",
        mobil: 10,
        motor: 17,
        keterangan: "Persimpangan dekat dengan area perkantoran dan pemukiman"
    },
    iskandar_lubis: {
        nama: "Iskandar Muda - Abdullah Lubis",
        mobil: 13,
        motor: 22,
        keterangan: "Aktivitas pasar tradisional dan sekolah di sekitar persimpangan"
    },
    yamin_william: {
        nama: "HM. Yamin - William Iskandar",
        mobil: 17,
        motor: 26,
        keterangan: "Berada di kawasan pendidikan dan perkantoran"
    },
    katamso_anidrus: {
        nama: "Katamso - Ani Idrus",
        mobil: 14,
        motor: 19,
        keterangan: "Persimpangan dekat rumah sakit dan pusat perbelanjaan"
    },
    sutomo_yamin: {
        nama: "Sutomo - Yamin",
        mobil: 10,
        motor: 18,
        keterangan: "Persimpangan yang menghubungkan Pemukiman dan perkantoran"
    },
    perintis_sutomo: {
        nama: "Perintis Kemerdekaan - Sutomo",
        mobil: 15,
        motor: 22,
        keterangan: "Menghubungkan beberapa kawasan pemukiman padat dan pusat kota"
    }
};


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
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)}`;
                        }
                    }
                },
                legend: { position: 'top' }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Waktu (detik)' },
                    ticks: { stepSize: 10 },
                    grid: { color: '#e0e0e0' }
                },
                y: {
                    title: { display: true, text: 'Akumulasi (gram)', color: '#dc2626' },
                    position: 'left',
                    beginAtZero: true
                },
                y1: {
                    title: { display: true, text: 'Laju (gram/detik)', color: '#3b82f6' },
                    position: 'right',
                    beginAtZero: true,
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });

    let lokasiTerpilih = document.getElementById('lokasi').options[document.getElementById('lokasi').selectedIndex]?.text || 'Tidak dipilih';
document.getElementById('integralInfo').innerHTML = `
    <p><strong>∫₀^${waktuDetik} r(t) dt ≈ Σ_{i=0}^{n-1} r(t_i) · 1 = ${totalEmisi.toFixed(2)} gram</strong> (Metode Left Riemann Sum, Δt=1 detik)</p>
    <p>📍 ${lokasiTerpilih} | 🚗 ${mobil} mobil | 🏍️ ${motor} motor | ⏱️ ${waktuDetik} detik</p>
    <p class="rumus-note">✨ Area biru di bawah kurva laju menunjukkan luas = total emisi.</p>
`;}

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
//                         UPDATE INFO DASHBOARD (LOKASI & JAM)
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
    let waktuDetik = parseInt(document.getElementById('waktu').value) || 60;  // default 60 detik

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

    let lokasiSelect = document.getElementById('lokasi');
    let lokasiNama = lokasiSelect.options[lokasiSelect.selectedIndex]?.text || 'Tidak dipilih';
    if (mobil > 0 || motor > 0) addToHistory(lokasiNama, mobil, motor, waktuDetik, totalEmisi);

    updateRekomendasiDinamis(totalEmisi, mobil, motor, waktuDetik);

    let lajuParsial = (1 / (waktuDetik + 2)) + (1 / (waktuDetik + 3));
    document.getElementById('lajuAkumulasi').innerHTML = lajuParsial.toFixed(4);
    document.getElementById('tValue').innerHTML = waktuDetik;

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
        const lokasiSelect = document.getElementById('lokasi');
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
    const lokasiSelect = document.getElementById('lokasi');
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
    const sections = ['dashboard-section', 'analisis-section', 'dampak-section', 'rekomendasi-section'];
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
    });
}

// ======================================================================
//                         INISIALISASI SAAT LOAD
// ======================================================================

window.addEventListener('load', () => {
    document.getElementById('mobil').value = '';
    document.getElementById('motor').value = '';
    document.getElementById('waktu').value = 60;  // default 60 detik

    initLokasiListener();
    initDataContoh();
    initScrollSpy();
    initBackToTop();
    initThemeToggle();

    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            smoothScrollToSection(target);
        });
    });

    const ctxKurva = document.getElementById('emisiChart');
    if (ctxKurva) {
        chart = new Chart(ctxKurva.getContext('2d'), {
            type: 'line',
            data: { labels: [0], datasets: [] },
            options: { responsive: true }
        });
    }
    updateHistoryChart();
    updateDashboardInfo();

    const integralInfo = document.getElementById('integralInfo');
    if (integralInfo) {
        integralInfo.innerHTML = '<p>👈 Masukkan data lalu klik "Hitung Emisi CO₂"</p>';
    }
});