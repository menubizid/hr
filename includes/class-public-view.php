<?php
if ( ! defined( 'ABSPATH' ) ) {
    die( 'Direct access not permitted.' );
}

class HR_JA_Public_View {
    public function __construct() {
        add_shortcode( 'hr_ja_public_doc', array( $this, 'render_public_doc' ) );
    }

    public function render_public_doc( $atts ) {
        $atts = shortcode_atts( array(
            'doc_id' => 0,
        ), $atts, 'hr_ja_public_doc' );

        $doc_id = absint( $atts['doc_id'] );

        if ( ! $doc_id && isset( $_GET['doc_id'] ) ) {
            $doc_id = absint( sanitize_text_field( wp_unslash( $_GET['doc_id'] ) ) );
        }

        if ( ! $doc_id ) {
            return '<p>Dokumen tidak ditemukan atau ID tidak valid.</p>';
        }

        global $wpdb;
        $table = $wpdb->prefix . 'hr_documents';

        $doc = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d AND status = 'Published'", $doc_id ) );

        if ( !$doc ) {
            return '<div class="p-4 bg-red-100 text-red-700 rounded">Dokumen tidak ditemukan atau belum dipublikasikan.</div>';
        }

        // Increment Views
        $wpdb->query( $wpdb->prepare( "UPDATE $table SET views = views + 1 WHERE id = %d", $doc_id ) );

        $content = json_decode( $doc->content, true );
        if ( !$content ) $content = array();

        // Enqueue necessary scripts for public view
        wp_enqueue_script( 'tailwindcss', 'https://cdn.tailwindcss.com', array(), null, false );
        wp_enqueue_script( 'mermaid', 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js', array(), null, true );
        add_action('wp_footer', function() {
            echo "<script>document.addEventListener('DOMContentLoaded', function() { if(typeof mermaid !== 'undefined') mermaid.initialize({startOnLoad:true}); });</script>";
        }, 100);

        ob_start();
        ?>
        <div class="max-w-3xl mx-auto bg-white p-6 shadow-lg rounded-lg font-sans text-gray-800">
            <div class="border-b-2 border-blue-600 pb-4 mb-6">
                <h1 class="text-3xl font-bold text-blue-900"><?php echo esc_html( $doc->title ); ?></h1>
                <div class="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Tipe: <?php echo esc_html( $doc->doc_type ); ?></span>
                    <span>Dilihat: <?php echo intval( $doc->views + 1 ); ?> kali</span>
                </div>
            </div>

            <!-- Media Section (Youtube, Slides, Image, Icon) -->
            <?php if (!empty($content['media_image']) || !empty($content['media_youtube']) || !empty($content['media_slide'])) : ?>
            <div class="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 class="font-bold text-blue-800 border-b pb-2 mb-3">Media / Referensi Visual</h3>
                <?php if (!empty($content['media_image'])) : ?>
                    <img src="<?php echo esc_url($content['media_image']); ?>" class="max-w-full h-auto rounded mb-4 shadow" alt="Gambar Dokumen">
                <?php endif; ?>
                <?php if (!empty($content['media_youtube'])) : ?>
                    <div class="mb-4">
                        <a href="<?php echo esc_url($content['media_youtube']); ?>" target="_blank" class="text-blue-600 underline font-bold flex items-center">
                            ▶️ Tonton Video YouTube Terkait
                        </a>
                    </div>
                <?php endif; ?>
                <?php if (!empty($content['media_slide'])) : ?>
                    <div class="mb-4">
                        <a href="<?php echo esc_url($content['media_slide']); ?>" target="_blank" class="text-blue-600 underline font-bold flex items-center">
                            📊 Buka Google Slides Presentasi
                        </a>
                    </div>
                <?php endif; ?>
            </div>
            <?php endif; ?>

            <div class="space-y-6">
                <?php if (!empty($content['tujuan'])) : ?>
                    <div>
                        <h3 class="font-bold text-blue-800 text-lg border-b pb-1 mb-2">Tujuan</h3>
                        <p><?php echo esc_html($content['tujuan']); ?></p>
                    </div>
                <?php endif; ?>

                <?php if (!empty($content['org_chart'])) : ?>
                    <div>
                        <h3 class="font-bold text-blue-800 text-lg border-b pb-1 mb-2">Struktur Organisasi</h3>
                        <div class="mermaid bg-gray-50 p-4 rounded border text-center overflow-x-auto">
                            <?php echo esc_html($content['org_chart']); ?>
                        </div>
                    </div>
                <?php endif; ?>

                <?php if ( $doc->doc_type === 'JA' ) : ?>
                    <div>
                        <h3 class="font-bold text-blue-800 text-lg border-b pb-1 mb-2">Relasi Jabatan</h3>
                        <p><b>Atasan:</b> <?php echo esc_html($content['atasan'] ?? '-'); ?></p>
                        <p><b>Bawahan:</b> <?php echo esc_html($content['bawahan'] ?? '-'); ?> (<?php echo intval($content['jml_bawahan'] ?? 0); ?> orang)</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-blue-50 p-4 rounded">
                            <h4 class="font-bold text-blue-800 mb-2">Job Specifications (KSAs)</h4>
                            <p class="text-sm"><b>Knowledge:</b><br><?php echo nl2br(esc_html($content['ksa_knowledge'] ?? '-')); ?></p>
                            <p class="text-sm mt-2"><b>Skills & Abilities:</b><br><?php echo nl2br(esc_html($content['ksa_skills'] ?? '-')); ?></p>
                            <p class="text-sm mt-2"><b>Behaviors:</b><br><?php echo nl2br(esc_html($content['ksa_behaviors'] ?? '-')); ?></p>
                        </div>
                        <div class="bg-blue-50 p-4 rounded">
                            <h4 class="font-bold text-blue-800 mb-2">Job Evaluation (SERWC)</h4>
                            <p class="text-sm"><b>Skill & Effort:</b><br><?php echo nl2br(esc_html($content['serwc_skill'] ?? '-')); ?></p>
                            <p class="text-sm mt-2"><b>Responsibility:</b><br><?php echo nl2br(esc_html($content['serwc_responsibility'] ?? '-')); ?></p>
                            <p class="text-sm mt-2"><b>Working Conditions:</b><br><?php echo nl2br(esc_html($content['serwc_working_conditions'] ?? '-')); ?></p>
                        </div>
                    </div>

                    <div>
                        <h3 class="font-bold text-blue-800 text-lg border-b pb-1 mb-2">Tugas, Tanggung Jawab & Wewenang</h3>
                        <div class="prose text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded border"><?php echo esc_html($content['tugas_list'] ?? '-'); ?></div>
                    </div>

                    <?php if (!empty($content['job_relation_chart'])) : ?>
                        <div>
                            <h3 class="font-bold text-blue-800 text-lg border-b pb-1 mb-2">Flowchart Job Relation</h3>
                            <div class="mermaid bg-gray-50 p-4 rounded border text-center overflow-x-auto">
                                <?php echo esc_html($content['job_relation_chart']); ?>
                            </div>
                        </div>
                    <?php endif; ?>

                <?php elseif ( $doc->doc_type === 'SOP' ) : ?>
                    <div>
                        <h3 class="font-bold text-blue-800 text-lg border-b pb-1 mb-2">Langkah-langkah Kerja (SOP)</h3>
                        <div class="prose text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded border"><?php echo esc_html($content['sop_steps'] ?? '-'); ?></div>
                    </div>

                    <?php if (!empty($content['sop_flowchart'])) : ?>
                        <div>
                            <h3 class="font-bold text-blue-800 text-lg border-b pb-1 mb-2">Flowchart SOP</h3>
                            <div class="mermaid bg-gray-50 p-4 rounded border text-center overflow-x-auto">
                                <?php echo esc_html($content['sop_flowchart']); ?>
                            </div>
                        </div>
                    <?php endif; ?>
                <?php endif; ?>

                <div>
                    <h3 class="font-bold text-blue-800 text-lg border-b pb-1 mb-2">Key Performance Indicators (KPI)</h3>
                    <div class="prose text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded border"><?php echo esc_html($content['kpi_list'] ?? '-'); ?></div>
                </div>
            </div>

            <!-- Suggestion / Improvement Button to Admin WA -->
            <div class="mt-8 text-center border-t pt-6">
                <p class="text-sm text-gray-500 mb-3">Ada saran perbaikan untuk dokumen ini?</p>
                <?php
                    $admin_wa = get_option('hr_ja_admin_wa_number', '');
                    $wa_msg = urlencode("Halo, saya ingin memberikan saran perbaikan untuk dokumen " . $doc->doc_type . " berjudul: " . $doc->title);
                ?>
                <a href="https://wa.me/<?php echo esc_attr($admin_wa); ?>?text=<?php echo $wa_msg; ?>" target="_blank" class="inline-block bg-green-500 text-white font-bold py-2 px-6 rounded shadow hover:bg-green-600 transition">
                    Kirim Saran Perbaikan via WhatsApp
                </a>
            </div>

            <!-- Manager Approval Signature Display -->
            <?php if ( $doc->is_approved == 1 && $doc->approver_id ) : ?>
                <?php
                    $approver = get_userdata($doc->approver_id);
                    $sig_url = get_user_meta($doc->approver_id, 'hr_ja_signature_url', true);
                ?>
                <div class="mt-8 flex justify-end">
                    <div class="text-center">
                        <p class="text-xs text-gray-500 mb-1">Disetujui Oleh:</p>
                        <?php if ($sig_url) : ?>
                            <img src="<?php echo esc_url($sig_url); ?>" class="h-16 mx-auto mb-1" alt="Signature">
                        <?php else: ?>
                            <div class="h-16 border-b border-gray-300 w-32 mx-auto mb-1 flex items-end justify-center text-xs text-gray-300">TTD Digital</div>
                        <?php endif; ?>
                        <p class="font-bold text-sm text-gray-800"><?php echo esc_html($approver ? $approver->display_name : 'Manajer'); ?></p>
                        <p class="text-xs text-gray-500">Telah Diverifikasi Sistem</p>
                    </div>
                </div>
            <?php endif; ?>

        </div>
        <?php
        return ob_get_clean();
    }
}
