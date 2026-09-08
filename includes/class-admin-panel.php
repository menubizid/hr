<?php
if ( ! defined( 'ABSPATH' ) ) {
    die( 'Direct access not permitted.' );
}

class HR_JA_Admin_Panel {

    public function __construct() {
        add_action( 'admin_menu', array( $this, 'register_admin_menu' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );
        add_action( 'show_user_profile', array( $this, 'add_custom_user_fields' ) );
        add_action( 'edit_user_profile', array( $this, 'add_custom_user_fields' ) );
        add_action( 'personal_options_update', array( $this, 'save_custom_user_fields' ) );
        add_action( 'edit_user_profile_update', array( $this, 'save_custom_user_fields' ) );
    }

    public function register_admin_menu() {
        add_menu_page(
            'HR Job Analysis',
            'HR Job Analysis',
            'manage_options',
            'hr-ja-dashboard',
            array( $this, 'render_dashboard' ),
            'dashicons-groups',
            30
        );

        add_submenu_page(
            'hr-ja-dashboard',
            'Departments',
            'Departments',
            'manage_options',
            'hr-ja-departments',
            array( $this, 'render_departments' )
        );

        add_submenu_page(
            'hr-ja-dashboard',
            'Settings',
            'Settings',
            'manage_options',
            'hr-ja-settings',
            array( $this, 'render_settings' )
        );
    }

    public function register_settings() {
        register_setting( 'hr_ja_settings_group', 'hr_ja_app_name' );
        register_setting( 'hr_ja_settings_group', 'hr_ja_admin_wa_number' );
    }

    public function render_dashboard() {
        echo '<div class="wrap"><h1>HR Job Analysis - Admin Dashboard</h1>';
        echo '<p>Welcome to the HR Job Analysis & Job Evaluation plugin admin panel.</p></div>';
    }

    public function render_departments() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'hr_departments';

        // Handle Form Submission (Basic CRUD Create)
        if ( isset( $_POST['submit_dept'] ) && current_user_can( 'manage_options' ) ) {
            $name = sanitize_text_field( $_POST['dept_name'] );
            $desc = sanitize_textarea_field( $_POST['dept_desc'] );
            if ( !empty( $name ) ) {
                $wpdb->insert( $table_name, array( 'name' => $name, 'description' => $desc ) );
                echo '<div class="updated"><p>Department added.</p></div>';
            }
        }

        // Handle Delete
        if ( isset( $_GET['delete_dept'] ) && current_user_can( 'manage_options' ) ) {
            $id = intval( $_GET['delete_dept'] );
            $wpdb->delete( $table_name, array( 'id' => $id ) );
            echo '<div class="updated"><p>Department deleted.</p></div>';
        }

        $departments = $wpdb->get_results( "SELECT * FROM $table_name" );

        echo '<div class="wrap"><h1>Manage Departments</h1>';

        // List Departments
        echo '<table class="wp-list-table widefat fixed striped">';
        echo '<thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Action</th></tr></thead><tbody>';
        if ( $departments ) {
            foreach ( $departments as $dept ) {
                echo '<tr>';
                echo '<td>' . esc_html( $dept->id ) . '</td>';
                echo '<td>' . esc_html( $dept->name ) . '</td>';
                echo '<td>' . esc_html( $dept->description ) . '</td>';
                echo '<td><a href="?page=hr-ja-departments&delete_dept=' . esc_attr( $dept->id ) . '">Delete</a></td>';
                echo '</tr>';
            }
        } else {
            echo '<tr><td colspan="4">No departments found.</td></tr>';
        }
        echo '</tbody></table>';

        // Add Department Form
        echo '<h2>Add New Department</h2>';
        echo '<form method="post" action="">';
        echo '<table class="form-table">';
        echo '<tr><th scope="row"><label for="dept_name">Department Name</label></th>';
        echo '<td><input type="text" name="dept_name" id="dept_name" class="regular-text" required></td></tr>';
        echo '<tr><th scope="row"><label for="dept_desc">Description</label></th>';
        echo '<td><textarea name="dept_desc" id="dept_desc" class="large-text" rows="3"></textarea></td></tr>';
        echo '</table>';
        submit_button( 'Add Department', 'primary', 'submit_dept' );
        echo '</form>';
        echo '</div>';
    }

    public function render_settings() {
        echo '<div class="wrap"><h1>HR Job Analysis Settings</h1>';
        echo '<form method="post" action="options.php">';
        settings_fields( 'hr_ja_settings_group' );
        do_settings_sections( 'hr_ja_settings_group' );

        echo '<table class="form-table">';
        echo '<tr><th scope="row">App Name</th><td><input type="text" name="hr_ja_app_name" value="' . esc_attr( get_option('hr_ja_app_name') ) . '" class="regular-text" /></td></tr>';
        echo '<tr><th scope="row">Admin WhatsApp Number</th><td><input type="text" name="hr_ja_admin_wa_number" value="' . esc_attr( get_option('hr_ja_admin_wa_number') ) . '" class="regular-text" /></td></tr>';
        echo '</table>';

        submit_button();
        echo '</form></div>';
    }

    public function add_custom_user_fields( $user ) {
        global $wpdb;
        $departments = $wpdb->get_results( "SELECT id, name FROM {$wpdb->prefix}hr_departments" );

        echo '<h3>HR Job Analysis User Info</h3>';
        echo '<table class="form-table">';

        // Department Dropdown
        $current_dept = get_user_meta( $user->ID, 'hr_ja_department', true );
        echo '<tr><th><label for="hr_ja_department">Department</label></th><td>';
        echo '<select name="hr_ja_department" id="hr_ja_department">';
        echo '<option value="">Select Department</option>';
        if ( $departments ) {
            foreach ( $departments as $dept ) {
                $selected = selected( $current_dept, $dept->id, false );
                echo "<option value='" . esc_attr( $dept->id ) . "' $selected>" . esc_html( $dept->name ) . "</option>";
            }
        }
        echo '</select>';
        echo '</td></tr>';

        // Direct Supervisor Name
        $supervisor = get_user_meta( $user->ID, 'hr_ja_supervisor_name', true );
        echo '<tr><th><label for="hr_ja_supervisor_name">Supervisor Name</label></th><td>';
        echo '<input type="text" name="hr_ja_supervisor_name" id="hr_ja_supervisor_name" value="' . esc_attr( $supervisor ) . '" class="regular-text" />';
        echo '</td></tr>';

        // Job Title
        $job_title = get_user_meta( $user->ID, 'hr_ja_job_title', true );
        echo '<tr><th><label for="hr_ja_job_title">Job Title</label></th><td>';
        echo '<input type="text" name="hr_ja_job_title" id="hr_ja_job_title" value="' . esc_attr( $job_title ) . '" class="regular-text" />';
        echo '</td></tr>';

        // Signature Upload URL
        $signature = get_user_meta( $user->ID, 'hr_ja_signature_url', true );
        echo '<tr><th><label for="hr_ja_signature_url">Signature Image URL</label></th><td>';
        echo '<input type="text" name="hr_ja_signature_url" id="hr_ja_signature_url" value="' . esc_attr( $signature ) . '" class="regular-text" />';
        echo '<p class="description">URL to the signature image for document approvals.</p>';
        echo '</td></tr>';

        echo '</table>';
    }

    public function save_custom_user_fields( $user_id ) {
        if ( !current_user_can( 'edit_user', $user_id ) ) {
            return false;
        }

        if ( isset( $_POST['hr_ja_department'] ) ) {
            update_user_meta( $user_id, 'hr_ja_department', intval( $_POST['hr_ja_department'] ) );
        }
        if ( isset( $_POST['hr_ja_supervisor_name'] ) ) {
            update_user_meta( $user_id, 'hr_ja_supervisor_name', sanitize_text_field( $_POST['hr_ja_supervisor_name'] ) );
        }
        if ( isset( $_POST['hr_ja_job_title'] ) ) {
            update_user_meta( $user_id, 'hr_ja_job_title', sanitize_text_field( $_POST['hr_ja_job_title'] ) );
        }
        if ( isset( $_POST['hr_ja_signature_url'] ) ) {
            update_user_meta( $user_id, 'hr_ja_signature_url', sanitize_url( $_POST['hr_ja_signature_url'] ) );
        }
    }
}
