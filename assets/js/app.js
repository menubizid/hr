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

    // PDF Template Builder
    window.buildPdfTemplate = function(type, data) {
        let templateId = 'pdf-template-wrapper';
        $('#' + templateId).remove();

        let dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        let html = `<div id="${templateId}" style="position: absolute; left: -9999px; top: 0; width: 800px; background: white; padding: 40px; font-family: sans-serif; color: #333;">
            <div style="border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <h1 style="color: #1e3a8a; margin: 0; font-size: 24px; font-weight: bold;">HR Job Analysis CMS</h1>
                    <h2 style="color: #4b5563; margin: 5px 0 0 0; font-size: 18px;">${type === 'work_plan' ? 'Dokumen Rencana Kerja Harian' : 'Dokumen Laporan'}</h2>
                </div>
                <div style="text-align: right; color: #6b7280; font-size: 12px;">
                    Tanggal: ${dateStr}<br>
                    Dicetak Secara Otomatis
                </div>
            </div>
            <div id="${templateId}-content"></div>
        </div>`;

        $('body').append(html);
        return $('#' + templateId);
    };

    window.triggerPdfWorkPlan = function(btnId) {
        let btn = $('#' + btnId);
        let origText = btn.html();
        btn.html('<span class="animate-pulse">Menghasilkan PDF...</span>');

        // Fetch tasks to build the plan
        $.ajax({
            url: apiRoot + 'tasks', headers: apiHeaders,
            success: function(tasks) {
                let wrapper = window.buildPdfTemplate('work_plan');
                let content = wrapper.find('#pdf-template-wrapper-content');

                let activeTasks = tasks.filter(t => t.status !== 'Done');

                let tbl = `<p style="margin-bottom:15px; font-size: 14px;">Berikut adalah daftar tugas aktif (tertunda/sedang berjalan) untuk diselesaikan hari ini:</p>`;
                tbl += `<table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="background: #f3f4f6;">
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Judul Tugas</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Kategori</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Prioritas</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Status</th>
                        </tr>
                    </thead>
                    <tbody>`;

                if (activeTasks.length === 0) {
                    tbl += `<tr><td colspan="4" style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Tidak ada tugas aktif.</td></tr>`;
                } else {
                    activeTasks.forEach(t => {
                        tbl += `<tr>
                            <td style="border: 1px solid #d1d5db; padding: 8px; font-weight: bold;">${window.escapeHtml(t.title)}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${t.category}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; color: ${t.priority==='Tinggi'?'#dc2626':'#374151'};${t.priority==='Tinggi'?'font-weight:bold;':''}">${t.priority}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${t.status}</td>
                        </tr>`;
                    });
                }
                tbl += `</tbody></table>`;

                content.html(tbl);

                // Render with html2canvas
                if (window.html2canvas && window.jspdf) {
                    window.html2canvas(wrapper[0], { scale: 2 }).then(canvas => {
                        const imgData = canvas.toDataURL('image/jpeg', 0.8);
                        const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

                        const base64Pdf = pdf.output('datauristring');

                        $.ajax({
                            url: apiRoot + 'pdfs', method: 'POST', headers: apiHeaders,
                            data: { pdf_type: 'work_plan', pdf_base64: base64Pdf },
                            success: function() {
                                btn.html('<span class="text-green-700">✅ Berhasil Disimpan & Diunduh</span>');
                                pdf.save(`Rencana_Kerja_${Date.now()}.pdf`);
                                if(typeof window.loadPdfArchives === 'function') window.loadPdfArchives();

                                setTimeout(() => btn.html(origText), 3000);
                                wrapper.remove(); // cleanup
                            }
                        });
                    });
                }

                $('#eval-period-filter').val(period);
                $('#eval-period-filter').off('change').on('change', function() {
                    window.loadProfile(container, $(this).val());
                });
                window.loadPdfArchives = loadPdfArchives;
            }
        });
    };

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

    // Silent Automated Background PDF Generation
    function triggerSilentPdfGeneration(type) {
        $.ajax({
            url: apiRoot + 'pdfs?type=' + type, headers: apiHeaders,
            success: function(pdfs) {
                let today = new Date().toISOString().split('T')[0];
                let existsToday = pdfs.some(p => p.date === today);
                if (!existsToday) {
                    console.log('Silently generating daily PDF for ' + type);

                    setTimeout(() => {
                        let element = document.getElementById(elementId) || document.getElementById('app-view-container');
                        if (window.html2canvas && window.jspdf) {
                            window.html2canvas(element, { scale: 2 }).then(canvas => {
                                const imgData = canvas.toDataURL('image/jpeg', 0.8);
                                const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
                                const pdfWidth = pdf.internal.pageSize.getWidth();
                                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

                                const base64Pdf = pdf.output('datauristring');

                                $.ajax({
                                    url: apiRoot + 'pdfs', method: 'POST', headers: apiHeaders,
                                    data: { pdf_type: type, pdf_base64: base64Pdf },
                                    success: function() {
                                        btn.html('<span class="text-green-700">✅ Berhasil Disimpan & Diunduh</span>');
                                        pdf.save(`Harian_${type}_${Date.now()}.pdf`);
                                        loadPdfArchives();
                                        setTimeout(() => btn.html(origText), 3000);
                                    }
                                });
                            });
                        }
                    }, 500);
                }

                $('#btn-generate-plan').on('click', () => { window.triggerPdfWorkPlan('btn-generate-plan'); }); // Using null as we don't have a specific div for "plan" in profile, would come from dashboard/tasks
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
                                        arcHtml += `<div class="flex justify-between border-b border-gray-200 py-1 items-center">
                                            <div>
                                                <span class="text-gray-600 font-bold">${p.pdf_type.toUpperCase()}</span>
                                                <span class="text-gray-400 text-xs ml-2">${p.date}</span>
                                            </div>
                                            <a href="${window.escapeHtml(p.file_url)}" target="_blank" download class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold hover:bg-blue-200">Unduh</a>
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
