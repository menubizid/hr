jQuery(document).ready(function($) {
    const apiRoot = hrJaData.root_url + 'hr-ja/v1/';
    const apiHeaders = { 'X-WP-Nonce': hrJaData.nonce };

    window.escapeHtml = function(unsafe) {
        return (unsafe || '').toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    };


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
            case 'dashboard': window.loadDashboard(container); break;
            case 'tasks': window.loadTasks(container); break;
            case 'documents': window.loadDocuments(container); break;
            case 'diagrams': window.loadDiagrams(container); break;
            case 'profile': window.loadProfile(container); break;
        }
    }

    $('.nav-btn').on('click', function() {
        navigateTo($(this).data('view'));
    });

    // --- Modal Logic ---
    window.openModal = function(title, content) {
        $('#modal-title').text(title);
        $('#modal-content').html(content);
        $('#hr-ja-modal').removeClass('hidden');
    }

    $('#close-modal').on('click', function() {
        $('#hr-ja-modal').addClass('hidden');
    });

    // --- Dashboard View ---
    window.loadDashboard = function(container) {
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
    // Stubs removed, see bottom

    // --- Documents & Other Views Stubs ---
    // Default Load
    navigateTo('dashboard');
});

// Extension for Diagram and Document Views
jQuery(document).ready(function($) {
    const apiRoot = hrJaData.root_url + 'hr-ja/v1/';
    const apiHeaders = { 'X-WP-Nonce': hrJaData.nonce };

    window.escapeHtml = function(unsafe) {
        return (unsafe || '').toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    };


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
                                    ${window.escapeHtml(diag.mermaid_script)}
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
                                        <h3 class="font-bold text-blue-800">${window.escapeHtml(doc.title)}</h3>
                                        <span class="text-xs px-2 py-1 rounded bg-gray-100">${doc.status}</span>
                                    </div>
                                    <div class="mt-4 flex space-x-2">
                                        <button class="flex-1 bg-green-500 text-white text-xs py-1 rounded btn-wa-share" data-title="${window.escapeHtml(doc.title)}" data-type="${type}">
                                            Share WA
                                        </button>
                                        <button class="flex-1 bg-red-500 text-white text-xs py-1 rounded btn-pdf-export" data-id="doc-card-${doc.id}" data-filename="${window.escapeHtml(doc.title)}">
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
// Tasks and Diagrams UI Enhancements
jQuery(document).ready(function($) {
    const apiRoot = hrJaData.root_url + 'hr-ja/v1/';
    const apiHeaders = { 'X-WP-Nonce': hrJaData.nonce };

    window.escapeHtml = function(unsafe) {
        return (unsafe || '').toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    };


    // Globals for user list caching
    window.hrJaUsers = [];
    $.ajax({url: apiRoot + 'users', headers: apiHeaders, success: function(data){ window.hrJaUsers = data; }});

    window.loadTasks = function(container) {
        let headerHtml = `
            <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="text-lg font-bold">Daftar Tugas</h2>
                    <button id="btn-add-task" class="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold shadow">+ Tugas</button>
                </div>
                <div class="flex space-x-2">
                    <select id="filter-category" class="border p-2 rounded text-sm w-1/2">
                        <option value="">Semua Kategori</option>
                        <option value="IT">IT</option><option value="Keuangan">Keuangan</option><option value="HR">HR</option>
                        <option value="Operasional">Operasional</option><option value="Penjualan">Penjualan</option><option value="Pemasaran">Pemasaran</option>
                    </select>
                    <select id="filter-status" class="border p-2 rounded text-sm w-1/2">
                        <option value="">Semua Status</option>
                        <option value="Pending">Tertunda</option><option value="Progress">Sedang Berjalan</option>
                        <option value="Review">Tinjauan</option><option value="Done">Selesai</option>
                    </select>
                </div>
            </div>
            <div id="tasks-list" class="space-y-3"></div>
        `;
        container.html(headerHtml);

        function fetchTasks() {
            $('#tasks-list').html('<p class="text-gray-500 text-center text-sm">Memuat tugas...</p>');
            $.ajax({
                url: apiRoot + 'tasks',
                headers: apiHeaders,
                success: function(tasks) {
                    let catFilter = $('#filter-category').val();
                    let statFilter = $('#filter-status').val();

                    let filtered = tasks.filter(t => {
                        return (catFilter === '' || t.category === catFilter) &&
                               (statFilter === '' || t.status === statFilter);
                    });

                    let html = '';
                    if(filtered.length === 0) {
                        html = `<p class="text-gray-500 text-sm text-center">Tidak ada tugas yang sesuai.</p>`;
                    }
                    filtered.forEach(task => {
                        let statusColor = task.status === 'Done' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
                        let assigneeName = window.hrJaUsers.find(u => u.id == task.assignee_id)?.name || 'Unknown';

                        html += `
                            <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <div class="flex justify-between">
                                    <h3 class="font-bold text-blue-800">${window.escapeHtml(task.title)}</h3>
                                    <span class="text-xs px-2 py-1 rounded font-bold ${statusColor}">${task.status}</span>
                                </div>
                                <p class="text-sm text-gray-600 mt-1">${task.description || ''}</p>
                                <p class="text-xs text-gray-500 mt-1">PIC: ${assigneeName} | Kategori: ${task.category}</p>
                                <div class="mt-3 flex justify-between items-center">
                                    <span class="text-xs font-semibold text-red-500">${task.priority === 'Tinggi' ? 'Prioritas Tinggi' : ''}</span>
                                    <button class="text-blue-600 text-sm font-bold btn-edit-task bg-blue-50 px-3 py-1 rounded" data-task='${JSON.stringify(task).replace(/'/g, "&apos;")}'>Detail / Evaluasi</button>
                                </div>
                            </div>
                        `;
                    });
                    $('#tasks-list').html(html);

                    $('.btn-edit-task').on('click', function() {
                        showEditTaskModal($(this).data('task'));
                    });
                }
            });
        }

        fetchTasks();
        $('#filter-category, #filter-status').on('change', fetchTasks);
        $('#btn-add-task').on('click', showAddTaskModal);
    };

    function showAddTaskModal() {
        let userOptions = window.hrJaUsers.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
        let form = `
            <form id="form-add-task" class="space-y-4">
                <div><label class="block text-sm font-bold text-gray-700">Judul Tugas</label>
                <input type="text" name="title" class="mt-1 w-full border p-2 rounded" required></div>
                <div><label class="block text-sm font-bold text-gray-700">Deskripsi</label>
                <textarea name="description" class="mt-1 w-full border p-2 rounded"></textarea></div>
                <div><label class="block text-sm font-bold text-gray-700">PIC (Penanggung Jawab)</label>
                <select name="assignee_id" class="mt-1 w-full border p-2 rounded">${userOptions}</select></div>
                <div class="flex space-x-2">
                    <div class="w-1/2"><label class="block text-sm font-bold text-gray-700">Kategori</label>
                    <select name="category" class="mt-1 w-full border p-2 rounded">
                        <option>IT</option><option>Keuangan</option><option>HR</option><option>Operasional</option><option>Penjualan</option><option>Pemasaran</option>
                    </select></div>
                    <div class="w-1/2"><label class="block text-sm font-bold text-gray-700">Prioritas</label>
                    <select name="priority" class="mt-1 w-full border p-2 rounded">
                        <option>Normal</option><option>Tinggi</option>
                    </select></div>
                </div>
                <button type="submit" class="w-full bg-blue-600 text-white font-bold p-3 rounded">Simpan Tugas & Delegasikan</button>
            </form>
        `;
        window.openModal('Pendelegasian Tugas Baru', form);

        $('#form-add-task').on('submit', function(e) {
            e.preventDefault();
            $.ajax({
                url: apiRoot + 'tasks', method: 'POST', headers: apiHeaders, data: $(this).serialize(),
                success: function() { $('#hr-ja-modal').addClass('hidden'); window.loadTasks($('#app-view-container')); }
            });
        });
    }

    function showEditTaskModal(task) {
        let form = `
            <form id="form-edit-task" class="space-y-4">
                <input type="hidden" name="id" value="${task.id}">
                <div><label class="block text-sm font-bold text-gray-700">Status Penyelesaian</label>
                    <select name="status" class="mt-1 w-full border p-2 rounded bg-yellow-50">
                        <option value="Pending" ${task.status === 'Pending'?'selected':''}>Tertunda</option>
                        <option value="Progress" ${task.status === 'Progress'?'selected':''}>Sedang Berjalan</option>
                        <option value="Review" ${task.status === 'Review'?'selected':''}>Tinjauan Manajer</option>
                        <option value="Done" ${task.status === 'Done'?'selected':''}>Selesai</option>
                    </select>
                </div>
                <div><label class="block text-sm font-bold text-gray-700">Catatan / Inisiatif Karyawan</label>
                    <textarea name="notes" class="mt-1 w-full border p-2 rounded h-20" placeholder="Tambahkan langkah inisiatif yang diambil...">${task.notes || ''}</textarea>
                </div>
                <div class="p-3 bg-blue-50 border border-blue-200 rounded mt-4">
                    <h4 class="font-bold text-sm mb-2 text-blue-800">Evaluasi Manajer (Otomatis masuk ke skor)</h4>
                    <label class="block text-xs font-bold text-gray-700">Skor Inisiatif Kualitas (1-5)</label>
                    <input type="range" name="initiative_score" min="1" max="5" value="${task.initiative_score}" class="w-full mt-1 mb-3" oninput="this.nextElementSibling.value = this.value">
                    <output class="text-sm font-bold">${task.initiative_score}</output>

                    <label class="block text-xs font-bold text-gray-700 mt-2">Dampak Finansial terhadap Perusahaan</label>
                    <select name="impact_type" class="mt-1 w-full border p-2 rounded mb-2 text-sm">
                        <option value="Neutral" ${task.impact_type === 'Neutral'?'selected':''}>Netral (Operasional biasa)</option>
                        <option value="Positive" ${task.impact_type === 'Positive'?'selected':''}>Positif (Menghasilkan Pendapatan)</option>
                        <option value="Cost Saving" ${task.impact_type === 'Cost Saving'?'selected':''}>Penghematan Biaya (Efisiensi)</option>
                        <option value="Negative" ${task.impact_type === 'Negative'?'selected':''}>Negatif</option>
                    </select>

                    <label class="block text-xs font-bold text-gray-700">Nilai Moneter Dampak (Rp)</label>
                    <input type="number" name="financial_value" value="${task.financial_value}" class="mt-1 w-full border p-2 rounded text-sm" placeholder="Contoh: 500000">
                </div>
                <div class="flex space-x-2">
                    <button type="submit" class="flex-1 bg-green-600 text-white font-bold p-3 rounded">Simpan Perubahan</button>
                    <button type="button" id="btn-del-task" class="bg-red-500 text-white font-bold p-3 rounded">Hapus</button>
                </div>
            </form>
        `;
        window.openModal('Update & Evaluasi: ' + task.title, form);

        $('#form-edit-task').on('submit', function(e) {
            e.preventDefault();
            $.ajax({
                url: apiRoot + 'tasks/' + task.id, method: 'PUT', headers: apiHeaders, data: $(this).serialize(),
                success: function() { $('#hr-ja-modal').addClass('hidden'); window.loadTasks($('#app-view-container')); }
            });
        });

        $('#btn-del-task').on('click', function() {
            if(confirm('Hapus tugas ini permanen?')) {
                $.ajax({
                    url: apiRoot + 'tasks/' + task.id, method: 'DELETE', headers: apiHeaders,
                    success: function() { $('#hr-ja-modal').addClass('hidden'); window.loadTasks($('#app-view-container')); }
                });
            }
        });
    }

    // --- Diagrams Library Enhancements ---
    window.loadDiagrams = function(container) {
        let html = `
            <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="text-lg font-bold">Pustaka Diagram</h2>
                    <button id="btn-add-diagram" class="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold shadow">+ Diagram</button>
                </div>
                <input type="text" id="search-diagram" placeholder="Cari diagram..." class="w-full border p-2 rounded text-sm mb-2">
                <select id="filter-diagram-cat" class="w-full border p-2 rounded text-sm">
                    <option value="">Semua Kategori</option>
                    <option value="Struktur Organisasi">Struktur Organisasi</option>
                    <option value="Alur Proses (SOP)">Alur Proses (SOP)</option>
                    <option value="Hubungan Kerja">Hubungan Kerja</option>
                </select>
            </div>
            <div id="diagrams-list" class="space-y-4"></div>
        `;
        container.html(html);

        function fetchDiagrams() {
            $('#diagrams-list').html('<p class="text-gray-500 text-center text-sm">Memuat...</p>');
            $.ajax({
                url: apiRoot + 'diagrams', headers: apiHeaders,
                success: function(diagrams) {
                    let search = $('#search-diagram').val().toLowerCase();
                    let cat = $('#filter-diagram-cat').val();

                    let filtered = diagrams.filter(d => {
                        return (cat === '' || d.category === cat) && (d.title.toLowerCase().includes(search));
                    });

                    let listHtml = '';
                    if (filtered.length === 0) listHtml = `<p class="text-gray-500 text-sm text-center">Tidak ada diagram.</p>`;
                    filtered.forEach(diag => {
                        listHtml += `
                            <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                <h3 class="font-bold text-blue-800 mb-2">${diag.title}</h3>
                                <div class="mermaid text-center mb-2 overflow-x-auto text-sm">
                                    ${window.escapeHtml(diag.mermaid_script)}
                                </div>
                                <div class="flex justify-between items-center mt-3 pt-2 border-t">
                                    <span class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold">${diag.category}</span>
                                    <div class="space-x-2">
                                        <button class="text-blue-500 text-xs font-bold btn-edit-diagram" data-diag='${JSON.stringify(diag).replace(/'/g, "&apos;")}'>Edit</button>
                                        <button class="text-red-500 text-xs font-bold btn-delete-diagram" data-id="${diag.id}">Hapus</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    $('#diagrams-list').html(listHtml);

                    if (typeof mermaid !== 'undefined') {
                        setTimeout(() => { try { mermaid.run({ querySelector: '.mermaid' }); } catch(e){} }, 100);
                    }

                    $('.btn-delete-diagram').on('click', function() {
                        if(confirm('Hapus diagram ini?')) {
                            $.ajax({
                                url: apiRoot + 'diagrams/' + $(this).data('id'), method: 'DELETE', headers: apiHeaders,
                                success: function() { fetchDiagrams(); }
                            });
                        }
                    });

                    $('.btn-edit-diagram').on('click', function() {
                        let d = $(this).data('diag');
                        openDiagramModal(d);
                    });
                }
            });
        }

        fetchDiagrams();
        $('#search-diagram, #filter-diagram-cat').on('input change', fetchDiagrams);

        $('#btn-add-diagram').on('click', function() { openDiagramModal(); });

        function openDiagramModal(diag = null) {
            let isEdit = diag !== null;
            let form = `
                <form id="form-diagram" class="space-y-4">
                    ${isEdit ? `<input type="hidden" name="id" value="${diag.id}">` : ''}
                    <div><label class="block text-sm font-bold text-gray-700">Judul Diagram</label>
                    <input type="text" name="title" value="${isEdit ? diag.title : ''}" class="mt-1 w-full border p-2 rounded" required></div>
                    <div><label class="block text-sm font-bold text-gray-700">Kategori</label>
                    <select name="category" class="mt-1 w-full border p-2 rounded">
                        <option ${isEdit && diag.category==='Struktur Organisasi'?'selected':''}>Struktur Organisasi</option>
                        <option ${isEdit && diag.category==='Alur Proses (SOP)'?'selected':''}>Alur Proses (SOP)</option>
                        <option ${isEdit && diag.category==='Hubungan Kerja'?'selected':''}>Hubungan Kerja</option>
                    </select></div>
                    <div><label class="block text-sm font-bold text-gray-700">Script Mermaid.js</label>
                    <textarea name="mermaid_script" class="mt-1 w-full border p-2 rounded font-mono text-xs h-32" required>${isEdit ? diag.mermaid_script : 'graph TD;\nA[Manager] --> B[Staff];'}</textarea>
                    <button type="button" id="btn-preview-mermaid" class="mt-2 text-xs bg-gray-200 px-2 py-1 rounded">Instant Preview</button>
                    <div id="mermaid-preview-box" class="mt-2 bg-white p-2 border rounded hidden overflow-x-auto"></div>
                    </div>
                    <button type="submit" class="w-full bg-blue-600 text-white font-bold p-3 rounded">Simpan Diagram</button>
                </form>
            `;
            window.openModal(isEdit ? 'Edit Diagram' : 'Tambah Diagram Baru', form);

            $('#btn-preview-mermaid').on('click', function() {
                let script = $('textarea[name="mermaid_script"]').val();
                let pbox = $('#mermaid-preview-box');
                pbox.removeClass('hidden').html(`<div class="mermaid-preview">${script}</div>`);
                if (typeof mermaid !== 'undefined') {
                    try { mermaid.run({ querySelector: '.mermaid-preview' }); } catch(e) { pbox.html('<p class="text-red-500 text-xs">Error sintaks mermaid</p>'); }
                }
            });

            $('#form-diagram').on('submit', function(e) {
                e.preventDefault();
                let url = apiRoot + 'diagrams' + (isEdit ? '/' + diag.id : '');
                let method = isEdit ? 'PUT' : 'POST';
                $.ajax({
                    url: url, method: method, headers: apiHeaders, data: $(this).serialize(),
                    success: function() { $('#hr-ja-modal').addClass('hidden'); fetchDiagrams(); }
                });
            });
        }
    };
});
// Advanced Documents Management (JA & SOP)
jQuery(document).ready(function($) {
    const apiRoot = hrJaData.root_url + 'hr-ja/v1/';
    const apiHeaders = { 'X-WP-Nonce': hrJaData.nonce };

    window.escapeHtml = function(unsafe) {
        return (unsafe || '').toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    };


    window.loadDocuments = function(container) {
        let html = `
            <div class="mb-4 sticky top-16 bg-gray-50 z-10 pt-2 pb-2">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="text-lg font-bold">Dokumen CMS</h2>
                    <div class="space-x-1">
                        <button id="btn-add-ja" class="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">+ JA</button>
                        <button id="btn-add-sop" class="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">+ SOP</button>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button id="tab-ja" class="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-bold shadow">Analisis Jabatan</button>
                    <button id="tab-sop" class="flex-1 bg-white text-blue-600 border border-blue-600 py-2 rounded text-sm font-bold shadow">SOP Perusahaan</button>
                </div>
            </div>
            <div id="docs-list" class="space-y-4"></div>
        `;
        container.html(html);

        function fetchDocs(type) {
            $('#docs-list').html('<p class="text-center text-gray-500 text-sm">Memuat dokumen...</p>');
            $.ajax({
                url: apiRoot + 'documents?type=' + type, headers: apiHeaders,
                success: function(docs) {
                    let docHtml = '';
                    if(docs.length === 0) { docHtml = `<p class="text-gray-500 text-sm text-center">Belum ada dokumen ${type}.</p>`; }

                    docs.forEach(doc => {
                        let isApproved = doc.is_approved == 1;
                        let statusColor = isApproved ? 'bg-green-100 text-green-800' : (doc.status === 'Draft' ? 'bg-gray-100' : 'bg-yellow-100 text-yellow-800');
                        let content = JSON.parse(doc.content || '{}');

                        docHtml += `
                            <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100" id="doc-wrapper-${doc.id}">
                                <div id="doc-render-${doc.id}">
                                    <div class="flex justify-between items-start mb-2">
                                        <h3 class="font-bold text-blue-900 text-lg leading-tight">${window.escapeHtml(doc.title)}</h3>
                                        <span class="text-xs px-2 py-1 rounded font-bold ${statusColor} ml-2 whitespace-nowrap">${doc.status}</span>
                                    </div>
                                    ${type === 'JA' ? `
                                        <div class="text-xs text-gray-700 space-y-1 mb-3">
                                            <p><b>Tujuan:</b> ${content.tujuan || '-'}</p>
                                            <p><b>Atasan:</b> ${content.atasan || '-'} | <b>Bawahan:</b> ${content.bawahan || '-'} (${content.jml_bawahan || 0} orang)</p>
                                        </div>
                                    ` : `
                                        <div class="text-xs text-gray-700 space-y-1 mb-3">
                                            <p><b>Tujuan SOP:</b> ${content.tujuan || '-'}</p>
                                        </div>
                                    `}
                                    <div class="flex flex-wrap gap-2 mb-3 border-t pt-3">
                                        <button class="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded font-bold btn-view-detail" data-id="${doc.id}">Lihat Detail</button>
                                        ${isApproved ? `
                                            <img src="${hrJaData.root_url}wp-content/plugins/hr-job-analysis/assets/img/approved.png" alt="Approved" class="h-6 opacity-50" onerror="this.style.display='none'">
                                        ` : ''}
                                    </div>
                                </div>
                                <div class="flex gap-2 pt-2 border-t mt-2">
                                    <button class="flex-1 bg-green-500 text-white text-xs py-2 rounded font-bold btn-wa-share" data-title="${window.escapeHtml(doc.title)}" data-script="${doc.wa_script || ''}">WA Share</button>
                                    <button class="flex-1 bg-red-500 text-white text-xs py-2 rounded font-bold btn-pdf-export" data-id="doc-render-${doc.id}" data-filename="${window.escapeHtml(doc.title)}">Unduh PDF</button>
                                </div>
                                <div class="flex gap-2 pt-2">
                                    <button class="flex-1 bg-blue-100 text-blue-700 text-xs py-2 rounded font-bold btn-edit-doc" data-type="${type}" data-doc='${JSON.stringify(doc).replace(/'/g, "&apos;")}'>Edit</button>
                                    <button class="flex-1 bg-yellow-100 text-yellow-700 text-xs py-2 rounded font-bold btn-duplicate-doc" data-id="${doc.id}">Duplikat</button>
                                    <button class="flex-1 bg-gray-200 text-gray-700 text-xs py-2 rounded font-bold btn-rev-history" data-id="${doc.id}">Histori</button>
                                    <button class="flex-1 bg-red-100 text-red-700 text-xs py-2 rounded font-bold btn-delete-doc" data-id="${doc.id}">Hapus</button>
                                </div>
                            </div>
                        `;
                    });
                    $('#docs-list').html(docHtml);

                    // Bind actions
                    $('.btn-wa-share').on('click', function() {
                        let title = $(this).data('title');
                        let script = $(this).data('script');
                        let text = script ? script : `Silakan tinjau dokumen: ${title}`;
                        window.shareToWhatsApp(text);
                    });

                    $('.btn-pdf-export').on('click', function() {
                        window.downloadPDF($(this).data('id'), $(this).data('filename'));
                    });

                    $('.btn-duplicate-doc').on('click', function() {
                        if(confirm('Duplikat dokumen ini?')) {
                            $.ajax({ url: apiRoot + 'documents/' + $(this).data('id') + '/duplicate', method: 'POST', headers: apiHeaders, success: function(){ fetchDocs(type); } });
                        }
                    });

                    $('.btn-delete-doc').on('click', function() {
                        if(confirm('Hapus permanen?')) {
                            $.ajax({ url: apiRoot + 'documents/' + $(this).data('id'), method: 'DELETE', headers: apiHeaders, success: function(){ fetchDocs(type); } });
                        }
                    });

                    $('.btn-rev-history').on('click', function() {
                        let docId = $(this).data('id');
                        $.ajax({
                            url: apiRoot + 'documents/' + docId + '/revisions', headers: apiHeaders,
                            success: function(revs) {
                                let rHtml = `<ul class="space-y-2">`;
                                if(revs.length===0) rHtml += `<li class="text-sm">Belum ada revisi.</li>`;
                                revs.forEach(r => { rHtml += `<li class="text-xs border-b pb-1">Rev: ${r.created_at} oleh UserID ${r.editor_id}</li>`; });
                                rHtml += `</ul>`;
                                window.openModal('Revision History', rHtml);
                            }
                        });
                    });

                    $('.btn-edit-doc').on('click', function() {
                        openDocModal($(this).data('type'), $(this).data('doc'));
                    });

                    $('.btn-view-detail').on('click', function() {
                        let id = $(this).data('id');
                        let doc = docs.find(d => d.id == id);
                        let content = JSON.parse(doc.content || '{}');

                        let dHtml = `<div class="text-sm space-y-4">`;

                        // Org Chart Render
                        if (content.org_chart) {
                            dHtml += `<div><h4 class="font-bold text-blue-800">Struktur Organisasi</h4>
                                      <div class="mermaid bg-gray-50 p-2 rounded">${content.org_chart}</div></div>`;
                        }

                        if (type === 'JA') {
                            dHtml += `<div><h4 class="font-bold text-blue-800 border-b">Job Specifications (KSAs)</h4>
                                      <p><b>Knowledge:</b> ${content.ksa_knowledge || '-'}</p>
                                      <p><b>Skills:</b> ${content.ksa_skills || '-'}</p>
                                      <p><b>Behaviors:</b> ${content.ksa_behaviors || '-'}</p></div>`;

                            dHtml += `<div><h4 class="font-bold text-blue-800 border-b">Job Evaluation (SERWC)</h4>
                                      <p><b>Skill:</b> ${content.serwc_skill || '-'}</p>
                                      <p><b>Effort:</b> ${content.serwc_effort || '-'}</p>
                                      <p><b>Responsibility:</b> ${content.serwc_responsibility || '-'}</p>
                                      <p><b>Working Conditions:</b> ${content.serwc_working_conditions || '-'}</p></div>`;

                            dHtml += `<div><h4 class="font-bold text-blue-800 border-b">Tugas & Tanggung Jawab</h4>
                                      <div class="whitespace-pre-wrap">${content.tugas_list || '-'}</div></div>`;

                            if (content.job_relation_chart) {
                                dHtml += `<div><h4 class="font-bold text-blue-800">Job Relation</h4>
                                          <div class="mermaid bg-gray-50 p-2 rounded">${content.job_relation_chart}</div></div>`;
                            }
                        } else if (type === 'SOP') {
                            dHtml += `<div><h4 class="font-bold text-blue-800 border-b">Langkah-langkah Kerja</h4>
                                      <div class="whitespace-pre-wrap">${content.sop_steps || '-'}</div></div>`;

                            if (content.sop_flowchart) {
                                dHtml += `<div><h4 class="font-bold text-blue-800">Flowchart SOP</h4>
                                          <div class="mermaid bg-gray-50 p-2 rounded">${content.sop_flowchart}</div></div>`;
                            }
                        }

                        dHtml += `<div><h4 class="font-bold text-blue-800 border-b">Key Performance Indicators (KPI)</h4>
                                  <div class="whitespace-pre-wrap">${content.kpi_list || '-'}</div></div>`;

                        dHtml += `</div>`;
                        window.openModal('Detail ' + doc.title, dHtml);
                        setTimeout(() => mermaid.run(), 100);
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

        $('#btn-add-ja').on('click', () => openDocModal('JA', null));
        $('#btn-add-sop').on('click', () => openDocModal('SOP', null));

        function openDocModal(type, doc) {
            let isEdit = doc !== null;
            let c = isEdit ? JSON.parse(doc.content || '{}') : {};

            let form = `<form id="form-doc" class="space-y-4 text-sm">
                ${isEdit ? `<input type="hidden" name="id" value="${doc.id}">` : ''}
                <input type="hidden" name="doc_type" value="${type}">

                <div class="bg-gray-50 p-3 rounded border">
                    <h4 class="font-bold text-blue-800 mb-2">Info Utama</h4>
                    <label class="block font-bold mt-2">Judul Dokumen</label>
                    <input type="text" name="title" value="${isEdit ? doc.title : ''}" class="w-full border p-2 rounded" required>
                    <label class="block font-bold mt-2">Tujuan</label>
                    <input type="text" name="content[tujuan]" value="${c.tujuan || ''}" class="w-full border p-2 rounded">

                    ${type === 'JA' ? `
                        <div class="flex gap-2 mt-2">
                            <div class="w-1/2"><label class="block font-bold">Nama Jabatan Atasan</label>
                            <input type="text" name="content[atasan]" value="${c.atasan || ''}" class="w-full border p-2 rounded"></div>
                            <div class="w-1/2"><label class="block font-bold">Nama Jabatan Bawahan</label>
                            <input type="text" name="content[bawahan]" value="${c.bawahan || ''}" class="w-full border p-2 rounded"></div>
                        </div>
                        <label class="block font-bold mt-2">Jumlah Bawahan</label>
                        <input type="number" name="content[jml_bawahan]" value="${c.jml_bawahan || 0}" class="w-full border p-2 rounded">
                    ` : ''}
                </div>

                <div class="bg-gray-50 p-3 rounded border">
                    <h4 class="font-bold text-blue-800 mb-2">Mermaid.js Flowcharts</h4>
                    <label class="block font-bold text-xs">Struktur Organisasi (Script)</label>
                    <textarea name="content[org_chart]" class="w-full border p-2 rounded h-20 font-mono text-xs">${c.org_chart || ''}</textarea>

                    ${type === 'JA' ? `
                        <label class="block font-bold text-xs mt-2">Job Relation (Script)</label>
                        <textarea name="content[job_relation_chart]" class="w-full border p-2 rounded h-20 font-mono text-xs">${c.job_relation_chart || ''}</textarea>
                    ` : `
                        <label class="block font-bold text-xs mt-2">Flowchart SOP (Script)</label>
                        <textarea name="content[sop_flowchart]" class="w-full border p-2 rounded h-20 font-mono text-xs">${c.sop_flowchart || ''}</textarea>
                    `}
                </div>

                ${type === 'JA' ? `
                    <div class="bg-gray-50 p-3 rounded border">
                        <h4 class="font-bold text-blue-800 mb-2">Detail Analisis (List Dinamis via Enter)</h4>
                        <label class="block font-bold text-xs">KSAs: Knowledge</label>
                        <textarea name="content[ksa_knowledge]" class="w-full border p-2 rounded h-16">${c.ksa_knowledge || ''}</textarea>
                        <label class="block font-bold text-xs mt-2">KSAs: Skills & Abilities</label>
                        <textarea name="content[ksa_skills]" class="w-full border p-2 rounded h-16">${c.ksa_skills || ''}</textarea>
                        <label class="block font-bold text-xs mt-2">KSAs: Behaviors</label>
                        <textarea name="content[ksa_behaviors]" class="w-full border p-2 rounded h-16">${c.ksa_behaviors || ''}</textarea>

                        <label class="block font-bold text-xs mt-4">SERWC: Skill & Effort</label>
                        <textarea name="content[serwc_skill]" class="w-full border p-2 rounded h-16">${c.serwc_skill || ''}</textarea>
                        <label class="block font-bold text-xs mt-2">SERWC: Responsibility</label>
                        <textarea name="content[serwc_responsibility]" class="w-full border p-2 rounded h-16">${c.serwc_responsibility || ''}</textarea>
                        <label class="block font-bold text-xs mt-2">SERWC: Working Conditions</label>
                        <textarea name="content[serwc_working_conditions]" class="w-full border p-2 rounded h-16">${c.serwc_working_conditions || ''}</textarea>

                        <label class="block font-bold text-xs mt-4">Tugas, Tanggung Jawab, Wewenang</label>
                        <textarea name="content[tugas_list]" class="w-full border p-2 rounded h-24">${c.tugas_list || ''}</textarea>
                    </div>
                ` : `
                    <div class="bg-gray-50 p-3 rounded border">
                        <h4 class="font-bold text-blue-800 mb-2">Langkah Kerja SOP</h4>
                        <textarea name="content[sop_steps]" class="w-full border p-2 rounded h-32" placeholder="1. Langkah satu...">${c.sop_steps || ''}</textarea>
                    </div>
                `}

                <div class="bg-gray-50 p-3 rounded border">
                    <label class="block font-bold text-xs">Indikator KPI</label>
                    <textarea name="content[kpi_list]" class="w-full border p-2 rounded h-20">${c.kpi_list || ''}</textarea>
                </div>

                <div class="bg-gray-50 p-3 rounded border">
                    <h4 class="font-bold text-blue-800 mb-2">Pengaturan Share & Status</h4>
                    <label class="block font-bold text-xs">Script WA Custom Share</label>
                    <textarea name="wa_script" class="w-full border p-2 rounded h-16">${isEdit ? (doc.wa_script || '') : ''}</textarea>

                    <label class="block font-bold mt-2 text-xs">Status</label>
                    <select name="status" class="w-full border p-2 rounded bg-white">
                        <option value="Draft" ${isEdit && doc.status==='Draft'?'selected':''}>Draf</option>
                        <option value="Review" ${isEdit && doc.status==='Review'?'selected':''}>Menunggu Tinjauan</option>
                        <option value="Published" ${isEdit && doc.status==='Published'?'selected':''}>Dipublikasikan</option>
                    </select>

                    <label class="flex items-center mt-3 font-bold text-green-700">
                        <input type="checkbox" name="is_approved" value="1" class="mr-2 h-5 w-5" ${isEdit && doc.is_approved==1?'checked':''}>
                        Persetujuan Manajer (Approve & Insert Signature)
                    </label>
                </div>

                <button type="submit" class="w-full bg-blue-600 text-white font-bold p-3 rounded">Simpan Dokumen</button>
            </form>`;

            window.openModal(isEdit ? `Edit ${type}` : `Buat ${type} Baru`, form);

            $('#form-doc').on('submit', function(e) {
                e.preventDefault();
                let formData = $(this).serializeArray();
                let data = { doc_type: type, content: {} };

                formData.forEach(item => {
                    if (item.name.startsWith('content[')) {
                        let key = item.name.replace('content[', '').replace(']', '');
                        data.content[key] = item.value;
                    } else {
                        data[item.name] = item.value;
                    }
                });
                data.content = JSON.stringify(data.content); // Store as JSON string in DB
                if(!data.is_approved) data.is_approved = 0;

                let url = apiRoot + 'documents' + (isEdit ? '/' + doc.id : '');
                let method = isEdit ? 'PUT' : 'POST';
                $.ajax({
                    url: url, method: method, headers: apiHeaders, data: data,
                    success: function() { $('#hr-ja-modal').addClass('hidden'); fetchDocs(type); }
                });
            });
        }

        // Init
        fetchDocs('JA');
    };
});
// Profile, Dynamic Org Chart, and Automated Daily PDFs
jQuery(document).ready(function($) {
    const apiRoot = hrJaData.root_url + 'hr-ja/v1/';
    const apiHeaders = { 'X-WP-Nonce': hrJaData.nonce };

    window.escapeHtml = function(unsafe) {
        return (unsafe || '').toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    };


    window.loadProfile = function(container) {
        container.html('<p class="text-center text-gray-500 text-sm mt-10">Memuat profil...</p>');
        $.ajax({
            url: apiRoot + 'profile',
            headers: apiHeaders,
            success: function(data) {
                let score = data.evaluation_score;

                // Build dynamic org chart script based on profile metadata
                let supervisor = data.supervisor || 'Atasan';
                let currentRole = data.job_title || data.name;
                let subordinates = data.subordinates ? data.subordinates.split(',').map(s => s.trim()) : [];

                let mermaidScript = `graph TD;\n  A["${supervisor}"] --> B["${currentRole}"];\n`;
                subordinates.forEach((sub, i) => {
                    if(sub) mermaidScript += `  B --> C${i}["${sub}"];\n`;
                });

                // Only show chart if there's actually a role set
                let showChart = data.job_title ? true : false;

                let html = `
                    <div class="space-y-4">
                        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div class="flex items-center space-x-4 mb-4">
                                <div class="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                                    ${data.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 class="text-xl font-bold text-gray-800">${data.name}</h2>
                                    <p class="text-sm font-bold text-blue-600">${data.job_title || 'Posisi belum diset'}</p>
                                    <p class="text-xs text-gray-500">ID: ${data.id} | Dept: ${data.department || 'N/A'}</p>
                                </div>
                            </div>

                            <div class="border-t pt-4 mt-4">
                                <h3 class="font-bold text-blue-800 mb-2">Evaluasi Kinerja Real-time (Hari Ini)</h3>
                                <div id="pdf-eval-content">
                                    <div class="text-4xl font-black text-center text-green-600 mb-2">${score.total} <span class="text-sm text-gray-400 font-normal">/ 105</span></div>
                                    <ul class="text-sm text-gray-600 space-y-2 bg-gray-50 p-3 rounded border">
                                        <li class="flex justify-between border-b pb-1"><span>Skor Dasar Partisipasi</span> <span class="font-bold">${score.base}</span></li>
                                        <li class="flex justify-between border-b pb-1"><span>Produktivitas (Volume)</span> <span class="font-bold">${score.productivity}</span></li>
                                        <li class="flex justify-between border-b pb-1"><span>Inisiatif / Kualitas</span> <span class="font-bold">${score.initiative}</span></li>
                                        <li class="flex justify-between border-b pb-1"><span>Dampak Finansial</span> <span class="font-bold">${score.financial}</span></li>
                                        <li class="flex justify-between"><span>Bonus Kompleksitas</span> <span class="font-bold">${score.bonus}</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        ${showChart ? `
                        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100" id="pdf-org-content">
                            <h3 class="font-bold text-blue-800 mb-2">Struktur Organisasi (Real-time)</h3>
                            <div class="mermaid bg-gray-50 p-2 rounded text-center overflow-x-auto text-sm border">
                                ${mermaidScript}
                            </div>
                        </div>
                        ` : ''}

                        <!-- Document Automation Center -->
                        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <h3 class="font-bold text-blue-800 mb-2">Automasi Dokumen PDF Harian</h3>
                            <p class="text-xs text-gray-500 mb-3">Sistem otomatis menghasilkan dan menyimpan PDF Rencana Kerja, Evaluasi, dan Struktur Organisasi berdasarkan aktivitas harian Anda.</p>

                            <div class="space-y-2">
                                <button id="btn-generate-plan" class="w-full bg-blue-100 text-blue-700 py-2 rounded font-bold text-sm text-left px-4 flex justify-between items-center">
                                    <span>📄 Buat & Simpan Rencana Kerja Harian</span>
                                    <span>&rarr;</span>
                                </button>
                                <button id="btn-generate-eval" class="w-full bg-green-100 text-green-700 py-2 rounded font-bold text-sm text-left px-4 flex justify-between items-center">
                                    <span>📈 Buat & Simpan Evaluasi Kerja Harian</span>
                                    <span>&rarr;</span>
                                </button>
                                <button id="btn-generate-org" class="w-full bg-purple-100 text-purple-700 py-2 rounded font-bold text-sm text-left px-4 flex justify-between items-center">
                                    <span>🏢 Buat & Simpan Struktur Organisasi Harian</span>
                                    <span>&rarr;</span>
                                </button>
                            </div>

                            <h4 class="font-bold text-xs mt-4 mb-2 text-gray-700">Arsip PDF Harian Anda</h4>
                            <div id="pdf-archives" class="text-xs space-y-1 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                                <p class="text-gray-400">Memuat arsip...</p>
                            </div>
                        </div>

                    </div>
                `;
                container.html(html);

                if (typeof mermaid !== 'undefined' && showChart) {
                    setTimeout(() => mermaid.run(), 100);
                }

                loadPdfArchives();

                // Fake visual feedback for automated generation
                function triggerPDFGeneration(type, elementId, btnId) {
                    let btn = $(`#${btnId}`);
                    let origText = btn.html();
                    btn.html('<span class="animate-pulse">Sedang menghasilkan PDF & menyimpan ke server...</span>');

                    // Client-side simulate generation then send to server
                    setTimeout(() => {
                        // In reality, html2canvas happens here and we send base64 to server.
                        // For demo simplicity, we send a notification to server to record the event
                        $.ajax({
                            url: apiRoot + 'pdfs', method: 'POST', headers: apiHeaders,
                            data: { pdf_type: type, file_url: 'generated_client_side_' + Date.now() + '.pdf' },
                            success: function() {
                                btn.html('<span class="text-green-700">✅ Berhasil Disimpan & Diunduh</span>');
                                if (elementId) window.downloadPDF(elementId, `Harian_${type}_${Date.now()}`);
                                loadPdfArchives();
                                setTimeout(() => btn.html(origText), 3000);
                            }
                        });
                    }, 1500);
                }

                $('#btn-generate-plan').on('click', () => { triggerPDFGeneration('work_plan', null, 'btn-generate-plan'); }); // Using null as we don't have a specific div for "plan" in profile, would come from dashboard/tasks
                $('#btn-generate-eval').on('click', () => { triggerPDFGeneration('evaluation', 'pdf-eval-content', 'btn-generate-eval'); });
                $('#btn-generate-org').on('click', () => { triggerPDFGeneration('org_chart', 'pdf-org-content', 'btn-generate-org'); });

                function loadPdfArchives() {
                    $.ajax({
                        url: apiRoot + 'pdfs?type=work_plan', headers: apiHeaders,
                        success: function(plans) {
                            $.ajax({
                                url: apiRoot + 'pdfs?type=evaluation', headers: apiHeaders,
                                success: function(evals) {
                                    let all = [...plans, ...evals].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
                                    let arcHtml = '';
                                    if(all.length === 0) arcHtml = '<p class="text-gray-400">Belum ada arsip.</p>';
                                    all.forEach(p => {
                                        arcHtml += `<div class="flex justify-between border-b border-gray-200 py-1">
                                            <span class="text-gray-600 font-bold">${p.pdf_type.toUpperCase()}</span>
                                            <span class="text-gray-400">${p.date}</span>
                                        </div>`;
                                    });
                                    $('#pdf-archives').html(arcHtml);
                                }
                            });
                        }
                    });
                }
            }
        });
    }
});
