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

// Activation Hook
register_activation_hook( __FILE__, array( 'HR_JA_DB_Setup', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'HR_JA_DB_Setup', 'deactivate' ) );

// Initialize components
add_action( 'plugins_loaded', 'hr_ja_init_plugin' );
function hr_ja_init_plugin() {
    new HR_JA_Admin_Panel();
    new HR_JA_API_Endpoints();
    new HR_JA_Frontend_UI();
}
