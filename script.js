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
let chart = null;          // grafik kurva di halaman Analisis
let historyChart = null;   // grafik batang di Dashboard

// Array untuk menyimpan data riwayat perhitungan
let historyData = [];

// Data referensi untuk 7 lokasi ITS Medan (hanya untuk tombol "Gunakan Data Contoh")
const dataITS = {
    jamin_ginting: {
        nama: "Jamin Ginting - Iskandar Muda",
        mobil: 22,
        motor: 38,
        keterangan: "Persimpangan utama menuju kampus ITS"
    },
    gatot_subroto: {
        nama: "Gatot Subroto - Iskandar Muda",
        mobil: 18,
        motor: 30,
        keterangan: "Lalu lintas sedang"
    },
    iskandar_lubis: {
        nama: "Iskandar Muda - Abdullah Lubis",
        mobil: 14,
        motor: 25,
        keterangan: "Dekat pasar tradisional"
    },
    yamin_william: {
        nama: "HM. Yamin - William Iskandar",
        mobil: 12,
        motor: 20,
        keterangan: "Area pendidikan"
    },
    katamso_anidrus: {
        nama: "Katamso - Ani Idrus",
        mobil: 16,
        motor: 28,
        keterangan: "Dekat rumah sakit"
    },
    sutomo_yamin: {
        nama: "Sutomo - Yamin",
        mobil: 10,
        motor: 18,
        keterangan: "Lalu lintas ringan"
    },
    perintis_sutomo: {
        nama: "Perintis Kemerdekaan - Sutomo",
        mobil: 25,
        motor: 42,
        keterangan: "Persimpangan tersibuk"
    }
};

// ======================================================================
//                         FUNGSI PERHITUNGAN DASAR
// ======================================================================

/**
 * Menghitung laju emisi total (gram/detik) berdasarkan jumlah mobil dan motor.
 * Asumsi: laju konstan (tidak berubah terhadap waktu).
 */
function hitungLajuEmisi(mobil, motor) {
    return (mobil * LAJU_MOBIL_DASAR) + (motor * LAJU_MOTOR_DASAR);
}

/**
 * Menghitung akumulasi emisi menggunakan metode Left Riemann Sum.
 * Δt = 1 detik, partisi seragam dari 0 hingga waktuDetik.
 */
function hitungAkumulasiEmisiRiemann(mobil, motor, waktuDetik) {
    let dt = 1;                     // lebar partisi 1 detik
    let n = waktuDetik;             // jumlah subinterval
    let total = 0;                  // total emisi (akumulasi)
    let dataWaktu = [];             // array untuk sumbu X (waktu)
    let dataLaju = [];              // array untuk nilai laju emisi
    let dataAkumulasi = [];         // array untuk nilai akumulasi
    let akumulasi = 0;              // akumulasi sementara

    for (let i = 0; i <= n; i++) {
        let t = i * dt;             // waktu saat ini
        let laju = hitungLajuEmisi(mobil, motor);

        // Left Riemann Sum: tambahkan luas persegi panjang (laju * dt)
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

/**
 * Memperbarui grafik kurva (akumulasi merah, laju biru dengan fill).
 */
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
        <p><strong>∫₀^${waktuDetik} r(t) dt ≈ Σ r(t_i)·1 = ${totalEmisi.toFixed(2)} gram</strong> (Metode Left Riemann Sum, Δt=1 detik)</p>
        <p>📍 ${lokasiTerpilih} | 🚗 ${mobil} mobil | 🏍️ ${motor} motor | ⏱️ ${waktuDetik} detik</p>
        <p class="rumus-note">✨ Area biru di bawah kurva laju menunjukkan luas = total emisi.</p>
    `;
}

// ======================================================================
//                         GRAFIK BATANG (BAR CHART) - DASHBOARD
// ======================================================================

/**
 * Memperbarui grafik batang pada dashboard berdasarkan historyData.
 */
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

    // Urutkan data dari yang lama ke baru (agar grafik rapi)
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

/**
 * Menampilkan informasi perhitungan terakhir (lokasi dan jam) di bawah grafik batang.
 * Pastikan di file index.html ada elemen <div id="dashboardInfo"></div>
 */
function updateDashboardInfo() {
    const infoDiv = document.getElementById('dashboardInfo');
    if (!infoDiv) return;

    if (historyData.length === 0) {
        infoDiv.innerHTML = '<p>👈 Belum ada perhitungan. Lakukan hitung emisi terlebih dahulu.</p>';
        return;
    }

    const last = historyData[0]; // data terbaru (paling atas)
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

/**
 * Memperbarui rekomendasi berdasarkan hasil hitungan terakhir.
 */
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

/**
 * Menentukan level risiko berdasarkan total emisi.
 */
function getLevel(totalEmisi) {
    if (totalEmisi <= 50) return 'Rendah';
    if (totalEmisi <= 100) return 'Sedang';
    if (totalEmisi <= 150) return 'Tinggi';
    return 'Ekstrem';
}

/**
 * Menambahkan hasil perhitungan ke dalam riwayat (history).
 */
function addToHistory(lokasiNama, mobil, motor, waktu, totalEmisi) {
    const now = new Date();
    const waktuLabel = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' ' + now.toLocaleDateString('id-ID');
    const level = getLevel(totalEmisi);

    // Tambahkan ke awal array (data terbaru di atas)
    historyData.unshift({
        waktuLabel: waktuLabel,
        lokasi: lokasiNama,
        mobil: mobil,
        motor: motor,
        durasi: waktu,
        totalEmisi: totalEmisi,
        level: level
    });

    // Batasi maksimal 20 data
    if (historyData.length > 20) {
        historyData.pop();
    }

    // Perbarui tabel dan grafik
    updateHistoryTable();
    updateHistoryChart();
    updateDashboardInfo(); // <-- tambahan untuk info dashboard
}

/**
 * Memperbarui tampilan tabel riwayat.
 */
function updateHistoryTable() {
    const tbody = document.getElementById('historyBody');
    if (!tbody) return;

    if (historyData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Belum ada data. Hitung emisi terlebih dahulu.</td></tr>';
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

/**
 * Menghapus semua riwayat.
 */
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

/**
 * Fungsi utama yang dipanggil saat tombol "Hitung Emisi CO₂" diklik.
 * Membaca input, menghitung emisi, memperbarui grafik dan history.
 */
function hitungEmisi() {
    // Baca nilai input
    let mobil = parseInt(document.getElementById('mobil').value) || 0;
    let motor = parseInt(document.getElementById('motor').value) || 0;
    let waktuDetik = parseInt(document.getElementById('waktu').value) || 90;

    // Validasi
    if (mobil < 0) mobil = 0;
    if (motor < 0) motor = 0;
    if (waktuDetik < 1) waktuDetik = 1;

    // Simpan nilai input kembali (memastikan konsistensi)
    document.getElementById('mobil').value = mobil;
    document.getElementById('motor').value = motor;
    document.getElementById('waktu').value = waktuDetik;

    // Hitung akumulasi emisi dengan metode Left Riemann Sum
    let { dataWaktu, dataLaju, dataAkumulasi, totalEmisi } = hitungAkumulasiEmisiRiemann(mobil, motor, waktuDetik);

    // Hitung proporsi emisi dari mobil dan motor (berdasarkan laju dasar)
    let totalLajuDasar = (mobil * LAJU_MOBIL_DASAR) + (motor * LAJU_MOTOR_DASAR);
    let proporsiMobil = totalLajuDasar > 0 ? (mobil * LAJU_MOBIL_DASAR) / totalLajuDasar : 0;
    let emisiMobilGram = totalEmisi * proporsiMobil;
    let emisiMotorGram = totalEmisi * (1 - proporsiMobil);

    // Tampilkan hasil di card Hasil Estimasi
    document.getElementById('totalEmisi').innerHTML = totalEmisi.toFixed(2);
    document.getElementById('emisiMobil').innerHTML = emisiMobilGram.toFixed(2);
    document.getElementById('emisiMotor').innerHTML = emisiMotorGram.toFixed(2);
    document.getElementById('perSiklus').innerHTML = (totalEmisi / 1000).toFixed(4);
    document.getElementById('perJam').innerHTML = ((totalEmisi / 1000) * 20).toFixed(3);

    // Update grafik kurva
    updateGrafikKurva(dataWaktu, dataLaju, dataAkumulasi, totalEmisi, waktuDetik, mobil, motor);

    // Ambil nama lokasi yang dipilih (untuk dicatat di history)
    let lokasiSelect = document.getElementById('lokasi');
    let lokasiNama = lokasiSelect.options[lokasiSelect.selectedIndex]?.text || 'Tidak dipilih';

    // Tambahkan ke history jika ada kendaraan
    if (mobil > 0 || motor > 0) {
        addToHistory(lokasiNama, mobil, motor, waktuDetik, totalEmisi);
    }

    // Update rekomendasi dinamis
    updateRekomendasiDinamis(totalEmisi, mobil, motor, waktuDetik);

    // Update tampilan pecahan parsial (laju akumulasi antrian)
    let lajuParsial = (1 / (waktuDetik + 2)) + (1 / (waktuDetik + 3));
    document.getElementById('lajuAkumulasi').innerHTML = lajuParsial.toFixed(4);
    document.getElementById('tValue').innerHTML = waktuDetik;

    // Animasi tombol (efek klik)
    const btn = document.querySelector('.btn-primary');
    if (btn) {
        btn.style.transform = 'scale(0.98)';
        setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
    }
}

// ======================================================================
//                         DATA CONTOH & LOKASI INFO
// ======================================================================

/**
 * Inisialisasi tombol "Gunakan Data Contoh".
 * Saat diklik, akan mengisi input mobil dan motor dengan data dari lokasi yang dipilih.
 */
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

/**
 * Inisialisasi listener untuk pilihan lokasi.
 * Hanya menampilkan info, tidak mengisi input otomatis.
 */
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

/**
 * Inisialisasi scroll spy: mengaktifkan tombol navigasi sesuai section yang terlihat.
 */
function initScrollSpy() {
    const sections = ['dashboard-section', 'analisis-section', 'dampak-section', 'rekomendasi-section'];
    const navBtns = document.querySelectorAll('.nav-btn');

    function updateActiveButton() {
        let currentSection = '';
        const scrollPosition = window.scrollY + 120; // offset untuk sticky nav

        for (let section of sections) {
            const el = document.getElementById(section);
            if (el && scrollPosition >= el.offsetTop && scrollPosition < el.offsetTop + el.offsetHeight) {
                currentSection = section.replace('-section', '');
                break;
            }
        }

        navBtns.forEach(btn => {
            const target = btn.getAttribute('data-target');
            if (target === currentSection) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveButton);
    window.addEventListener('load', updateActiveButton);
}

/**
 * Smooth scroll ke section tertentu.
 */
function smoothScrollToSection(sectionId) {
    const section = document.getElementById(sectionId + '-section');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Inisialisasi tombol "Back to Top".
 */
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ======================================================================
//                         JAM REAL-TIME WIB
// ======================================================================

/**
 * Memperbarui jam digital setiap detik.
 */
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

// Jalankan updateClock setiap detik
setInterval(updateClock, 1000);
updateClock();

// ======================================================================
//                         DARK / LIGHT MODE TOGGLE
// ======================================================================

/**
 * Inisialisasi tombol toggle dark/light mode.
 * Menyimpan preferensi ke localStorage.
 */
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

    // Atur tema awal
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark');
        toggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark');
        toggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    // Event listener untuk toggle
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

        // Refresh chart agar warna menyesuaikan (opsional, tidak merusak data)
        if (historyData.length) {
            updateHistoryChart();
        }
        if (chart) {
            chart.destroy();
            chart = null;
        }
    });
}

// ======================================================================
//                         INISIALISASI SAAT LOAD
// ======================================================================

window.addEventListener('load', () => {
    // Set nilai awal (kosong, kecuali waktu default 90)
    const mobilInput = document.getElementById('mobil');
    const motorInput = document.getElementById('motor');
    const waktuInput = document.getElementById('waktu');
    if (mobilInput) mobilInput.value = '';
    if (motorInput) motorInput.value = '';
    if (waktuInput) waktuInput.value = 90;

    // Inisialisasi berbagai fitur
    initLokasiListener();
    initDataContoh();
    initScrollSpy();
    initBackToTop();
    initThemeToggle();

    // Event listener untuk tombol navigasi (smooth scroll)
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            smoothScrollToSection(target);
        });
    });

    // Inisialisasi grafik kosong
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