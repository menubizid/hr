<?php
if ( ! defined( 'ABSPATH' ) ) {
    die( 'Direct access not permitted.' );
}

class HR_JA_Frontend_UI {
    public function __construct() {
        add_shortcode( 'hr_ja_app', array( $this, 'render_app' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
    }

    public function enqueue_assets() {
        global $post;
        if ( is_a( $post, 'WP_Post' ) && has_shortcode( $post->post_content, 'hr_ja_app' ) ) {
            // Tailwind CSS for bright, clean, modern UI
            wp_enqueue_script( 'tailwindcss', 'https://cdn.tailwindcss.com', array(), null, false );

            // Mermaid.js for diagrams
            wp_enqueue_script( 'mermaid', 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js', array(), null, true );

            // jsPDF & html2canvas for PDF export
            wp_enqueue_script( 'jspdf', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', array(), null, true );
            wp_enqueue_script( 'html2canvas', 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', array(), null, true );

            // Custom JS and CSS
            wp_enqueue_style( 'hr-ja-style', HR_JA_PLUGIN_URL . 'assets/css/style.css', array(), '1.0.0' );
            wp_enqueue_script( 'hr-ja-app', HR_JA_PLUGIN_URL . 'assets/js/app.js', array('jquery'), '1.0.0', true );

            // Pass API URL and Nonce to JS
            wp_localize_script( 'hr-ja-app', 'hrJaData', array(
                'root_url' => esc_url_raw( rest_url() ),
                'nonce'    => wp_create_nonce( 'wp_rest' )
            ) );
        }
    }

    public function render_app() {
        if ( ! is_user_logged_in() ) {
            return '<div class="p-4 bg-red-100 text-red-700 rounded">Please log in to access the HR Job Analysis App.</div>';
        }

        ob_start();
        ?>
        <div id="hr-ja-app-container" class="bg-gray-50 min-h-screen text-gray-800 font-sans pb-20 relative">

            <!-- Header -->
            <header class="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10">
                <h1 class="text-xl font-bold">HR Job Analysis CMS</h1>
            </header>

            <!-- Main Content Area -->
            <main id="app-view-container" class="p-4">
                <!-- Content injected via JS -->
            </main>

            <!-- Bottom Navigation -->
            <nav class="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 text-sm shadow-lg z-20">
                <button class="nav-btn flex flex-col items-center text-gray-500 hover:text-blue-600" data-view="dashboard">
                    <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    <span>Beranda</span>
                </button>
                <button class="nav-btn flex flex-col items-center text-gray-500 hover:text-blue-600" data-view="tasks">
                    <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    <span>Tugas</span>
                </button>
                <button class="nav-btn flex flex-col items-center text-gray-500 hover:text-blue-600" data-view="documents">
                    <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    <span>Dokumen</span>
                </button>
                <button class="nav-btn flex flex-col items-center text-gray-500 hover:text-blue-600" data-view="diagrams">
                    <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
                    <span>Pustaka</span>
                </button>
                <button class="nav-btn flex flex-col items-center text-gray-500 hover:text-blue-600" data-view="profile">
                    <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    <span>Profil</span>
                </button>
            </nav>

            <!-- Global Modal Overlay -->
            <div id="hr-ja-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h2 id="modal-title" class="text-xl font-bold">Modal Title</h2>
                        <button id="close-modal" class="text-gray-500 hover:text-red-500 font-bold text-xl">&times;</button>
                    </div>
                    <div id="modal-content">
                        <!-- Dynamic modal content here -->
                    </div>
                </div>
            </div>

        </div>
        <?php
        return ob_get_clean();
    }
}
