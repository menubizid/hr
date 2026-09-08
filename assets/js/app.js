jQuery(document).ready(function($) {
    const apiRoot = hrJaData.root_url + 'hr-ja/v1/';
    const apiHeaders = { 'X-WP-Nonce': hrJaData.nonce };

    // Initialize Mermaid
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({ startOnLoad: false, theme: 'default' });
    }

    // --- Router / Navigation ---
    function navigateTo(view) {
        $('.nav-btn').removeClass('active');
        $(`.nav-btn[data-view="${view}"]`).addClass('active');

        const container = $('#app-view-container');
        container.html('<div class="flex justify-center p-10"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>');

        switch(view) {
            case 'dashboard': loadDashboard(container); break;
            case 'tasks': loadTasks(container); break;
            case 'documents': loadDocuments(container); break;
            case 'diagrams': loadDiagrams(container); break;
            case 'profile': loadProfile(container); break;
        }
    }

    $('.nav-btn').on('click', function() {
        navigateTo($(this).data('view'));
    });

    // --- Modal Logic ---
    function openModal(title, content) {
        $('#modal-title').text(title);
        $('#modal-content').html(content);
        $('#hr-ja-modal').removeClass('hidden');
    }

    $('#close-modal').on('click', function() {
        $('#hr-ja-modal').addClass('hidden');
    });

    // --- Dashboard View ---
    function loadDashboard(container) {
        $.ajax({
            url: apiRoot + 'dashboard',
            headers: apiHeaders,
            success: function(data) {
                let total = data.active_tasks + data.completed_tasks;
                let progress = total === 0 ? 0 : Math.round((data.completed_tasks / total) * 100);

                let html = `
                    <div class="space-y-6">
                        <!-- Morning Briefing -->
                        <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 shadow-sm">
                            <h3 class="font-bold text-yellow-800 flex items-center"><svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg> Pengarahan Pagi</h3>
                            <p class="text-sm mt-2 text-yellow-700">${data.morning_briefing}</p>
                        </div>

                        <!-- Task Progress -->
                        <div class="bg-white p-4 rounded-lg shadow-sm">
                            <h3 class="font-bold mb-2">Penyelesaian Tugas Hari Ini</h3>
                            <div class="w-full bg-gray-200 rounded-full h-4 mb-2">
                                <div class="bg-green-500 h-4 rounded-full" style="width: ${progress}%"></div>
                            </div>
                            <div class="flex justify-between text-xs text-gray-500">
                                <span>${data.active_tasks} Tertunda</span>
                                <span>${data.completed_tasks} Selesai</span>
                            </div>
                        </div>

                        <!-- Real-time Impact Metrics -->
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-blue-50 p-4 rounded-lg text-center shadow-sm">
                                <span class="block text-3xl font-bold text-blue-600">${data.active_tasks}</span>
                                <span class="text-xs text-gray-600">Tugas Aktif</span>
                            </div>
                            <div class="bg-green-50 p-4 rounded-lg text-center shadow-sm">
                                <span class="block text-xl font-bold text-green-600">Rp ${(data.financial_positive + data.financial_savings).toLocaleString('id-ID')}</span>
                                <span class="text-xs text-gray-600">Nilai Finansial</span>
                            </div>
                        </div>

                        <!-- Quick Shortcuts -->
                        <div class="bg-white p-4 rounded-lg shadow-sm">
                            <h3 class="font-bold mb-3">Pintasan Cepat</h3>
                            <div class="flex space-x-2">
                                <button class="flex-1 bg-blue-100 text-blue-700 p-2 rounded text-sm text-center font-semibold btn-shortcut" data-target="documents">Analisis Jabatan</button>
                                <button class="flex-1 bg-purple-100 text-purple-700 p-2 rounded text-sm text-center font-semibold btn-shortcut" data-target="documents">SOP</button>
                            </div>
                        </div>
                    </div>
                `;
                container.html(html);

                $('.btn-shortcut').on('click', function() {
                    navigateTo($(this).data('target'));
                });
            }
        });
    }

    // --- Tasks View ---
    function loadTasks(container) {
        $.ajax({
            url: apiRoot + 'tasks',
            headers: apiHeaders,
            success: function(tasks) {
                let html = `
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-bold">Daftar Tugas</h2>
                        <button id="btn-add-task" class="bg-blue-600 text-white px-3 py-1 rounded text-sm">+ Tugas</button>
                    </div>
                    <div class="space-y-3">
                `;
                if(tasks.length === 0) {
                    html += `<p class="text-gray-500 text-sm">Belum ada tugas.</p>`;
                }
                tasks.forEach(task => {
                    let statusColor = task.status === 'Done' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
                    html += `
                        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div class="flex justify-between">
                                <h3 class="font-bold text-blue-800">${task.title}</h3>
                                <span class="text-xs px-2 py-1 rounded ${statusColor}">${task.status}</span>
                            </div>
                            <p class="text-sm text-gray-600 mt-1">${task.description || 'Tidak ada deskripsi'}</p>
                            <div class="mt-3 flex justify-between items-center">
                                <span class="text-xs font-semibold text-gray-500">Kategori: ${task.category}</span>
                                <button class="text-blue-500 text-sm font-semibold btn-edit-task" data-id="${task.id}" data-task='${JSON.stringify(task).replace(/'/g, "&apos;")}'>Detail / Evaluasi</button>
                            </div>
                        </div>
                    `;
                });
                html += `</div>`;
                container.html(html);

                $('#btn-add-task').on('click', showAddTaskModal);
                $('.btn-edit-task').on('click', function() {
                    showEditTaskModal($(this).data('task'));
                });
            }
        });
    }

    function showAddTaskModal() {
        let form = `
            <form id="form-add-task" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Judul</label>
                    <input type="text" name="title" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Deskripsi</label>
                    <textarea name="description" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Kategori</label>
                    <select name="category" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border">
                        <option>IT</option><option>Keuangan</option><option>HR</option><option>Operasional</option><option>Penjualan</option><option>Pemasaran</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Prioritas</label>
                    <select name="priority" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border">
                        <option>Normal</option><option>Tinggi</option>
                    </select>
                </div>
                <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded">Simpan Tugas</button>
            </form>
        `;
        openModal('Tambah Tugas Baru', form);

        $('#form-add-task').on('submit', function(e) {
            e.preventDefault();
            let data = $(this).serialize();
            // Real application would fetch assignees dynamically. Hardcoding for now due to complex scope limitations, but ideally should be an input.
            $.ajax({
                url: apiRoot + 'tasks',
                method: 'POST',
                headers: apiHeaders,
                data: data,
                success: function() {
                    $('#hr-ja-modal').addClass('hidden');
                    navigateTo('tasks');
                }
            });
        });
    }

    function showEditTaskModal(task) {
        // Simplified Evaluation UI
        let form = `
            <form id="form-edit-task" class="space-y-4">
                <input type="hidden" name="id" value="${task.id}">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" class="mt-1 block w-full border p-2 rounded">
                        <option value="Pending" ${task.status === 'Pending'?'selected':''}>Tertunda</option>
                        <option value="Progress" ${task.status === 'Progress'?'selected':''}>Sedang Berjalan</option>
                        <option value="Review" ${task.status === 'Review'?'selected':''}>Tinjauan</option>
                        <option value="Done" ${task.status === 'Done'?'selected':''}>Selesai</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Catatan / Inisiatif</label>
                    <textarea name="notes" class="mt-1 block w-full border p-2 rounded">${task.notes || ''}</textarea>
                </div>
                <div class="p-3 bg-gray-50 border rounded mt-4">
                    <h4 class="font-bold text-sm mb-2 text-blue-600">Evaluasi (Manajer)</h4>
                    <label class="block text-xs font-medium text-gray-700">Skor Inisiatif (1-5)</label>
                    <input type="number" name="initiative_score" min="1" max="5" value="${task.initiative_score}" class="mt-1 block w-full border p-2 rounded mb-2">

                    <label class="block text-xs font-medium text-gray-700">Jenis Dampak</label>
                    <select name="impact_type" class="mt-1 block w-full border p-2 rounded mb-2">
                        <option value="Neutral" ${task.impact_type === 'Neutral'?'selected':''}>Netral</option>
                        <option value="Positive" ${task.impact_type === 'Positive'?'selected':''}>Positif (Pendapatan)</option>
                        <option value="Cost Saving" ${task.impact_type === 'Cost Saving'?'selected':''}>Penghematan Biaya</option>
                        <option value="Negative" ${task.impact_type === 'Negative'?'selected':''}>Negatif</option>
                    </select>

                    <label class="block text-xs font-medium text-gray-700">Nilai Dampak Finansial (IDR)</label>
                    <input type="number" name="financial_value" value="${task.financial_value}" class="mt-1 block w-full border p-2 rounded">
                </div>
                <button type="submit" class="w-full bg-green-600 text-white p-2 rounded">Update / Evaluasi</button>
            </form>
        `;
        openModal('Update Tugas: ' + task.title, form);

        $('#form-edit-task').on('submit', function(e) {
            e.preventDefault();
            let data = $(this).serialize();
            $.ajax({
                url: apiRoot + 'tasks/' + task.id,
                method: 'PUT',
                headers: apiHeaders,
                data: data,
                success: function() {
                    $('#hr-ja-modal').addClass('hidden');
                    navigateTo('tasks');
                }
            });
        });
    }

    // --- Documents & Other Views Stubs ---
    function loadDocuments(container) {
        container.html('<div class="p-4 text-center"><h2 class="text-xl font-bold mb-4">Sistem Manajemen Dokumen</h2><p class="text-gray-600 mb-4">Pilih jenis dokumen:</p><div class="flex space-x-2 justify-center"><button class="bg-blue-100 text-blue-700 px-4 py-2 rounded font-bold">Analisis Jabatan</button><button class="bg-purple-100 text-purple-700 px-4 py-2 rounded font-bold">SOP Perusahaan</button></div></div>');
    }

    function loadDiagrams(container) {
        container.html('<div class="p-4"><h2 class="text-xl font-bold mb-4">Pustaka Diagram</h2><div class="mermaid bg-white p-4 shadow rounded">graph TD; A[CEO]-->B[Manager]; B-->C[Staff];</div></div>');
        if(typeof mermaid !== 'undefined') {
            setTimeout(() => mermaid.run(), 100);
        }
    }

    function loadProfile(container) {
        $.ajax({
            url: apiRoot + 'profile',
            headers: apiHeaders,
            success: function(data) {
                let score = data.evaluation_score;
                let html = `
                    <div class="bg-white p-4 rounded-lg shadow-sm">
                        <div class="flex items-center space-x-4 mb-4">
                            <div class="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                ${data.name.charAt(0)}
                            </div>
                            <div>
                                <h2 class="text-xl font-bold">${data.name}</h2>
                                <p class="text-sm text-gray-500">${data.job_title || 'Posisi belum diset'}</p>
                            </div>
                        </div>
                        <div class="border-t pt-4 mt-4">
                            <h3 class="font-bold text-blue-800 mb-2">Skor Evaluasi Otomatis</h3>
                            <div class="text-3xl font-bold text-center text-green-600 mb-2">${score.total} <span class="text-sm text-gray-500">/ 105</span></div>
                            <ul class="text-sm text-gray-600 space-y-1">
                                <li>Skor Dasar: <span class="float-right font-bold">${score.base}</span></li>
                                <li>Produktivitas: <span class="float-right font-bold">${score.productivity}</span></li>
                                <li>Inisiatif: <span class="float-right font-bold">${score.initiative}</span></li>
                                <li>Finansial: <span class="float-right font-bold">${score.financial}</span></li>
                                <li>Bonus Kompleksitas: <span class="float-right font-bold">${score.bonus}</span></li>
                            </ul>
                        </div>
                    </div>
                `;
                container.html(html);
            }
        });
    }

    // Default Load
    navigateTo('dashboard');
});

// Extension for Diagram and Document Views
jQuery(document).ready(function($) {
    const apiRoot = hrJaData.root_url + 'hr-ja/v1/';
    const apiHeaders = { 'X-WP-Nonce': hrJaData.nonce };

    // This overrides the stub loadDiagrams function defined earlier to make it dynamic
    window.loadDiagrams = function(container) {
        $.ajax({
            url: apiRoot + 'diagrams',
            headers: apiHeaders,
            success: function(diagrams) {
                let html = `
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-bold">Pustaka Diagram</h2>
                        <button id="btn-add-diagram" class="bg-blue-600 text-white px-3 py-1 rounded text-sm">+ Diagram</button>
                    </div>
                    <div class="space-y-4">
                `;

                if (diagrams.length === 0) {
                    html += `<p class="text-gray-500 text-sm">Belum ada diagram.</p>`;
                } else {
                    diagrams.forEach(diag => {
                        html += `
                            <div class="bg-white p-4 rounded-lg shadow-sm">
                                <h3 class="font-bold text-blue-800 mb-2">${diag.title}</h3>
                                <div class="mermaid text-center mb-2">
                                    ${diag.mermaid_script}
                                </div>
                                <div class="flex justify-between items-center mt-2">
                                    <span class="text-xs text-gray-500">${diag.category}</span>
                                    <button class="text-red-500 text-sm font-semibold btn-delete-diagram" data-id="${diag.id}">Hapus</button>
                                </div>
                            </div>
                        `;
                    });
                }

                html += `</div>`;
                container.html(html);

                // Re-run Mermaid initialization for newly added DOM elements
                if (typeof mermaid !== 'undefined') {
                    setTimeout(() => {
                        try {
                            mermaid.run({
                                querySelector: '.mermaid'
                            });
                        } catch (e) {
                            console.error('Mermaid render error:', e);
                        }
                    }, 200);
                }

                $('#btn-add-diagram').on('click', function() {
                    let form = `
                        <form id="form-add-diagram" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Judul Diagram</label>
                                <input type="text" name="title" class="mt-1 block w-full border p-2 rounded" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Kategori</label>
                                <select name="category" class="mt-1 block w-full border p-2 rounded">
                                    <option>Struktur Organisasi</option><option>Alur Proses (SOP)</option><option>Hubungan Kerja</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700">Script Mermaid.js</label>
                                <textarea name="mermaid_script" class="mt-1 block w-full border p-2 rounded font-mono text-sm" rows="5" required>graph TD;
    A[Manager] --> B[Staff];</textarea>
                                <p class="text-xs text-gray-500 mt-1">Gunakan sintaks Mermaid.js untuk menggambar diagram.</p>
                            </div>
                            <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded">Simpan Diagram</button>
                        </form>
                    `;
                    $('#modal-title').text('Tambah Diagram Baru');
                    $('#modal-content').html(form);
                    $('#hr-ja-modal').removeClass('hidden');

                    $('#form-add-diagram').on('submit', function(e) {
                        e.preventDefault();
                        $.ajax({
                            url: apiRoot + 'diagrams',
                            method: 'POST',
                            headers: apiHeaders,
                            data: $(this).serialize(),
                            success: function() {
                                $('#hr-ja-modal').addClass('hidden');
                                window.loadDiagrams($('#app-view-container')); // Reload diagram view
                            }
                        });
                    });
                });

                $('.btn-delete-diagram').on('click', function() {
                    if(confirm('Hapus diagram ini?')) {
                        $.ajax({
                            url: apiRoot + 'diagrams/' + $(this).data('id'),
                            method: 'DELETE',
                            headers: apiHeaders,
                            success: function() {
                                window.loadDiagrams($('#app-view-container'));
                            }
                        });
                    }
                });
            }
        });
    };
});

// Extension for PDF Export and WA Sharing
jQuery(document).ready(function($) {
    // Add to Profile View for PDF Download and WA Share
    const originalLoadProfile = window.loadProfile;

    // We bind a global function so we can use it in the views
    window.downloadPDF = function(elementId, filename) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Use html2canvas to convert DOM to image, then jsPDF to make PDF
        html2canvas(element, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(filename + '.pdf');
        });
    };

    window.shareToWhatsApp = function(text) {
        // Create WA link
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    // Override document stubs with full functionality (including PDF and WA Share)
    window.loadDocuments = function(container) {
        let html = `
            <div class="mb-4">
                <h2 class="text-lg font-bold mb-2">Manajemen Dokumen</h2>
                <div class="flex space-x-2">
                    <button id="tab-ja" class="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-bold">Analisis Jabatan</button>
                    <button id="tab-sop" class="flex-1 bg-white text-blue-600 border border-blue-600 py-2 rounded text-sm font-bold">SOP Perusahaan</button>
                </div>
            </div>
            <div id="docs-list" class="space-y-4"></div>
        `;
        container.html(html);

        function fetchDocs(type) {
            $('#docs-list').html('<p class="text-center text-gray-500">Memuat data...</p>');
            $.ajax({
                url: hrJaData.root_url + 'hr-ja/v1/documents?type=' + type,
                headers: { 'X-WP-Nonce': hrJaData.nonce },
                success: function(docs) {
                    let docHtml = '';
                    if(docs.length === 0) {
                        docHtml = `<p class="text-gray-500 text-sm">Belum ada dokumen ${type}.</p>`;
                    } else {
                        docs.forEach(doc => {
                            docHtml += `
                                <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100" id="doc-card-${doc.id}">
                                    <div class="flex justify-between items-start">
                                        <h3 class="font-bold text-blue-800">${doc.title}</h3>
                                        <span class="text-xs px-2 py-1 rounded bg-gray-100">${doc.status}</span>
                                    </div>
                                    <div class="mt-4 flex space-x-2">
                                        <button class="flex-1 bg-green-500 text-white text-xs py-1 rounded btn-wa-share" data-title="${doc.title}" data-type="${type}">
                                            Share WA
                                        </button>
                                        <button class="flex-1 bg-red-500 text-white text-xs py-1 rounded btn-pdf-export" data-id="doc-card-${doc.id}" data-filename="${doc.title}">
                                            Unduh PDF
                                        </button>
                                    </div>
                                </div>
                            `;
                        });
                    }
                    $('#docs-list').html(docHtml);

                    $('.btn-wa-share').on('click', function() {
                        const title = $(this).data('title');
                        const type = $(this).data('type');
                        const text = `Halo, mohon tinjau dokumen ${type} terbaru: "${title}". Terima kasih.`;
                        window.shareToWhatsApp(text);
                    });

                    $('.btn-pdf-export').on('click', function() {
                        const elementId = $(this).data('id');
                        const filename = $(this).data('filename');
                        window.downloadPDF(elementId, filename);
                    });
                }
            });
        }

        $('#tab-ja').on('click', function() {
            $(this).addClass('bg-blue-600 text-white').removeClass('bg-white text-blue-600 border border-blue-600');
            $('#tab-sop').addClass('bg-white text-blue-600 border border-blue-600').removeClass('bg-blue-600 text-white');
            fetchDocs('JA');
        });

        $('#tab-sop').on('click', function() {
            $(this).addClass('bg-blue-600 text-white').removeClass('bg-white text-blue-600 border border-blue-600');
            $('#tab-ja').addClass('bg-white text-blue-600 border border-blue-600').removeClass('bg-blue-600 text-white');
            fetchDocs('SOP');
        });

        // Load default tab
        fetchDocs('JA');
    };
});
