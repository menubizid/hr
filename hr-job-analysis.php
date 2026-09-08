<?php
/**
 * Plugin Name: HR Job Analysis & Job Evaluation
 * Description: Aplikasi Mobile CMS Real Time Job Analysis & Job Evaluation Perusahaan
 * Version: 1.0.0
 * Author: Jules
 */

if ( ! defined( 'ABSPATH' ) ) {
    die( 'Direct access not permitted.' );
}

define( 'HR_JA_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'HR_JA_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Include necessary files
require_once HR_JA_PLUGIN_DIR . 'includes/class-db-setup.php';
require_once HR_JA_PLUGIN_DIR . 'includes/class-admin-panel.php';
require_once HR_JA_PLUGIN_DIR . 'includes/class-api-endpoints.php';
require_once HR_JA_PLUGIN_DIR . 'includes/class-frontend-ui.php';
require_once HR_JA_PLUGIN_DIR . 'includes/class-public-view.php';

// Activation Hook
register_activation_hook( __FILE__, 'hr_ja_activate_plugin' );
register_deactivation_hook( __FILE__, array( 'HR_JA_DB_Setup', 'deactivate' ) );

function hr_ja_activate_plugin() {
    // Set up DB
    HR_JA_DB_Setup::activate();

    // Auto-create the Frontend App Page if it doesn't exist
    $page_title = 'HR Job Analysis App';
    $page_content = '[hr_ja_app]';
    $page_check = get_page_by_title($page_title);

    if ( !isset($page_check->ID) ) {
        $page_id = wp_insert_post(array(
            'post_title'    => $page_title,
            'post_content'  => $page_content,
            'post_status'   => 'publish',
            'post_type'     => 'page',
        ));
        update_option('hr_ja_app_page_id', $page_id);
    }
}

// Add a notice in the admin panel to direct users to the frontend app
function hr_ja_add_admin_notice() {
    $page_id = get_option('hr_ja_app_page_id');
    if ($page_id) {
        $url = get_permalink($page_id);
        echo '<div class="notice notice-success"><p><strong>HR Job Analysis CMS:</strong> Frontend aplikasi mobile siap digunakan. <a href="' . esc_url($url) . '" target="_blank" style="font-weight:bold; color:#2271b1;">Buka Aplikasi Mobile CMS</a></p></div>';
    } else {
        echo '<div class="notice notice-warning"><p><strong>HR Job Analysis CMS:</strong> Anda perlu membuat sebuah Page baru di WordPress dan memasukkan shortcode <code>[hr_ja_app]</code> untuk menampilkan aplikasi mobile.</p></div>';
    }
}
add_action('admin_notices', 'hr_ja_add_admin_notice');

// Initialize components
add_action( 'plugins_loaded', 'hr_ja_init_plugin' );
function hr_ja_init_plugin() {
    new HR_JA_Admin_Panel();
    new HR_JA_API_Endpoints();
    new HR_JA_Frontend_UI();
    new HR_JA_Public_View();
}
