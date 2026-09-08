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
        add_menu_page( 'HR Job Analysis', 'HR Job Analysis', 'manage_options', 'hr-ja-dashboard', array( $this, 'render_dashboard' ), 'dashicons-groups', 30 );
        add_submenu_page( 'hr-ja-dashboard', 'Departments', 'Departments', 'manage_options', 'hr-ja-departments', array( $this, 'render_departments' ) );
        add_submenu_page( 'hr-ja-dashboard', 'User Management', 'User Management', 'manage_options', 'hr-ja-users', array( $this, 'render_users' ) );
        add_submenu_page( 'hr-ja-dashboard', 'Approval Settings', 'Approval Settings', 'manage_options', 'hr-ja-approvals', array( $this, 'render_approvals' ) );
        add_submenu_page( 'hr-ja-dashboard', 'Settings', 'Settings', 'manage_options', 'hr-ja-settings', array( $this, 'render_settings' ) );
    }

    public function register_settings() {
        register_setting( 'hr_ja_settings_group', 'hr_ja_app_name' );
        register_setting( 'hr_ja_settings_group', 'hr_ja_admin_wa_number' );
    }

    public function render_dashboard() {
        echo '<div class="wrap"><h1>HR Job Analysis - Admin Dashboard</h1>';
        echo '<p>Gunakan menu di sebelah kiri untuk mengelola departemen, pengguna, dan persetujuan.</p>';

        $page_id = get_option('hr_ja_app_page_id');
        if ($page_id) {
            $url = get_permalink($page_id);
            echo '<div style="margin-top:20px; padding:20px; background:#fff; border:1px solid #ccd0d4; border-left:4px solid #00a0d2; max-width:600px;">';
            echo '<h2 style="margin-top:0;">Aplikasi Mobile Tersedia</h2>';
            echo '<p>Aplikasi utama berada di bagian frontend (halaman web), bukan di sini. Admin panel ini hanya untuk pengaturan departemen dan struktur dasar.</p>';
            echo '<a href="' . esc_url($url) . '" target="_blank" class="button button-primary button-large">Buka Aplikasi Mobile CMS</a>';
            echo '</div>';
        }

        echo '</div>';
    }

    public function render_departments() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'hr_departments';

        if ( isset( $_POST['submit_dept'] ) && current_user_can( 'manage_options' ) && isset($_POST['_wpnonce']) && wp_verify_nonce($_POST['_wpnonce'], 'save_dept') ) {
            $name = sanitize_text_field( $_POST['dept_name'] );
            $desc = sanitize_textarea_field( $_POST['dept_desc'] );
            $pic = intval( $_POST['dept_pic'] );
            if ( isset( $_POST['dept_id'] ) && !empty($_POST['dept_id']) ) {
                $wpdb->update( $table_name, array( 'name' => $name, 'description' => $desc, 'pic_id' => $pic ), array('id' => intval($_POST['dept_id'])) );
                echo '<div class="updated"><p>Department updated.</p></div>';
            } else if ( !empty( $name ) ) {
                $wpdb->insert( $table_name, array( 'name' => $name, 'description' => $desc, 'pic_id' => $pic ) );
                echo '<div class="updated"><p>Department added.</p></div>';
            }
        }

        if ( isset( $_GET['delete_dept'] ) && current_user_can( 'manage_options' ) && isset($_GET['_wpnonce']) && wp_verify_nonce($_GET['_wpnonce'], 'delete_dept_' . $_GET['delete_dept']) ) {
            $id = intval( $_GET['delete_dept'] );
            $wpdb->delete( $table_name, array( 'id' => $id ) );
            echo '<div class="updated"><p>Department deleted.</p></div>';
        }

        $departments = $wpdb->get_results( "SELECT * FROM $table_name" );
        $users = get_users();

        echo '<div class="wrap"><h1>Manajemen Departemen</h1>';
        echo '<table class="wp-list-table widefat fixed striped">';
        echo '<thead><tr><th>ID</th><th>Nama</th><th>Deskripsi</th><th>PIC</th><th>Aksi</th></tr></thead><tbody>';
        if ( $departments ) {
            foreach ( $departments as $dept ) {
                $pic_name = 'None';
                if ($dept->pic_id) {
                    $u = get_userdata($dept->pic_id);
                    if ($u) $pic_name = $u->display_name;
                }
                echo '<tr>';
                echo '<td>' . esc_html( $dept->id ) . '</td>';
                echo '<td>' . esc_html( $dept->name ) . '</td>';
                echo '<td>' . esc_html( $dept->description ) . '</td>';
                echo '<td>' . esc_html( $pic_name ) . '</td>';
                echo '<td><a href="?page=hr-ja-departments&edit_dept=' . esc_attr( $dept->id ) . '">Edit</a> | <a href="' . wp_nonce_url( '?page=hr-ja-departments&delete_dept=' . esc_attr( $dept->id ), 'delete_dept_' . $dept->id ) . '" onclick="return confirm(\'Yakin?\')">Delete</a></td>';
                echo '</tr>';
            }
        } else {
            echo '<tr><td colspan="5">No departments found.</td></tr>';
        }
        echo '</tbody></table>';

        $edit_id = ''; $edit_name = ''; $edit_desc = ''; $edit_pic = '';
        if ( isset($_GET['edit_dept']) ) {
            $e_dept = $wpdb->get_row( $wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", intval($_GET['edit_dept'])) );
            if ($e_dept) {
                $edit_id = $e_dept->id; $edit_name = $e_dept->name; $edit_desc = $e_dept->description; $edit_pic = $e_dept->pic_id;
            }
        }

        echo '<h2>' . ($edit_id ? 'Edit Department' : 'Add New Department') . '</h2>';
        echo '<form method="post" action="?page=hr-ja-departments">';
        wp_nonce_field('save_dept');
        if ($edit_id) echo '<input type="hidden" name="dept_id" value="'.esc_attr($edit_id).'">';
        echo '<table class="form-table">';
        echo '<tr><th scope="row"><label for="dept_name">Nama Departemen</label></th>';
        echo '<td><input type="text" name="dept_name" id="dept_name" value="'.esc_attr($edit_name).'" class="regular-text" required></td></tr>';
        echo '<tr><th scope="row"><label for="dept_desc">Deskripsi</label></th>';
        echo '<td><textarea name="dept_desc" id="dept_desc" class="large-text" rows="3">'.esc_textarea($edit_desc).'</textarea></td></tr>';
        echo '<tr><th scope="row"><label for="dept_pic">PIC (Kepala Departemen)</label></th><td><select name="dept_pic"><option value="0">Pilih PIC</option>';
        foreach($users as $u) {
            echo '<option value="'.esc_attr($u->ID).'" '.selected($edit_pic, $u->ID, false).'>'.esc_html($u->display_name).'</option>';
        }
        echo '</select></td></tr>';
        echo '</table>';
        submit_button( $edit_id ? 'Update Department' : 'Add Department', 'primary', 'submit_dept' );
        echo '</form>';
        echo '</div>';
    }

    public function render_users() {
        echo '<div class="wrap"><h1>Manajemen Pengguna</h1>';
        echo '<p>Kelola Role, Password, dan Departemen via profil pengguna WordPress di menu <a href="'.admin_url('users.php').'">Users</a> standar, dengan field kustom yang telah ditambahkan.</p></div>';
    }

    public function render_approvals() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'hr_departments';
        $departments = $wpdb->get_results( "SELECT * FROM $table_name" );

        echo '<div class="wrap"><h1>Pengaturan Persetujuan Departemen</h1>';
        echo '<p>Setiap departemen memiliki PIC. Tanda tangan digital diambil dari profil User PIC.</p>';
        echo '<table class="wp-list-table widefat fixed striped">';
        echo '<thead><tr><th>Departemen</th><th>PIC Approval</th><th>Tanda Tangan Tersedia?</th></tr></thead><tbody>';
        if ( $departments ) {
            foreach ( $departments as $dept ) {
                $pic_name = 'Belum di-set';
                $has_sig = 'Tidak';
                if ($dept->pic_id) {
                    $u = get_userdata($dept->pic_id);
                    if ($u) {
                        $pic_name = $u->display_name;
                        $sig = get_user_meta($u->ID, 'hr_ja_signature_url', true);
                        if ($sig) $has_sig = 'Ya';
                    }
                }
                echo '<tr>';
                echo '<td>' . esc_html( $dept->name ) . '</td>';
                echo '<td>' . esc_html( $pic_name ) . '</td>';
                echo '<td>' . esc_html( $has_sig ) . '</td>';
                echo '</tr>';
            }
        }
        echo '</tbody></table></div>';
    }

    public function render_settings() {
        echo '<div class="wrap"><h1>Pengaturan Utama</h1>';
        echo '<form method="post" action="options.php">';
        settings_fields( 'hr_ja_settings_group' );
        do_settings_sections( 'hr_ja_settings_group' );

        echo '<table class="form-table">';
        echo '<tr><th scope="row">Nama Aplikasi</th><td><input type="text" name="hr_ja_app_name" value="' . esc_attr( get_option('hr_ja_app_name', 'HR Job Analysis CMS') ) . '" class="regular-text" /></td></tr>';
        echo '<tr><th scope="row">Admin WhatsApp Number</th><td><input type="text" name="hr_ja_admin_wa_number" value="' . esc_attr( get_option('hr_ja_admin_wa_number') ) . '" class="regular-text" /><p class="description">Gunakan format internasional tanpa + (contoh: 6281234567890)</p></td></tr>';
        echo '</table>';

        submit_button();
        echo '</form></div>';
    }

    public function add_custom_user_fields( $user ) {
        global $wpdb;
        $departments = $wpdb->get_results( "SELECT id, name FROM {$wpdb->prefix}hr_departments" );

        echo '<h3>Data Kepegawaian & Organisasi</h3>';
        echo '<table class="form-table">';

        $current_dept = get_user_meta( $user->ID, 'hr_ja_department', true );
        echo '<tr><th><label for="hr_ja_department">Departemen</label></th><td>';
        echo '<select name="hr_ja_department" id="hr_ja_department"><option value="">Select Department</option>';
        if ( $departments ) {
            foreach ( $departments as $dept ) {
                echo "<option value='" . esc_attr( $dept->id ) . "' " . selected( $current_dept, $dept->id, false ) . ">" . esc_html( $dept->name ) . "</option>";
            }
        }
        echo '</select></td></tr>';

        $supervisor = get_user_meta( $user->ID, 'hr_ja_supervisor_name', true );
        echo '<tr><th><label for="hr_ja_supervisor_name">Nama Jabatan Atasan Langsung</label></th><td><input type="text" name="hr_ja_supervisor_name" id="hr_ja_supervisor_name" value="' . esc_attr( $supervisor ) . '" class="regular-text" /></td></tr>';

        $job_title = get_user_meta( $user->ID, 'hr_ja_job_title', true );
        echo '<tr><th><label for="hr_ja_job_title">Nama Jabatan Karyawan</label></th><td><input type="text" name="hr_ja_job_title" id="hr_ja_job_title" value="' . esc_attr( $job_title ) . '" class="regular-text" /></td></tr>';

        $subordinates = get_user_meta( $user->ID, 'hr_ja_subordinates', true );
        echo '<tr><th><label for="hr_ja_subordinates">Jabatan Bawahan Langsung (Pisahkan koma)</label></th><td><input type="text" name="hr_ja_subordinates" id="hr_ja_subordinates" value="' . esc_attr( $subordinates ) . '" class="regular-text" /></td></tr>';

        $signature = get_user_meta( $user->ID, 'hr_ja_signature_url', true );
        echo '<tr><th><label for="hr_ja_signature_url">URL Tanda Tangan Digital</label></th><td><input type="url" name="hr_ja_signature_url" id="hr_ja_signature_url" value="' . esc_attr( $signature ) . '" class="regular-text" /><p class="description">URL gambar tanda tangan, wajib untuk Manajer/Admin.</p></td></tr>';

        echo '</table>';
    }

    public function save_custom_user_fields( $user_id ) {
        if ( !current_user_can( 'edit_user', $user_id ) ) return false;

        update_user_meta( $user_id, 'hr_ja_department', intval( $_POST['hr_ja_department'] ) );
        update_user_meta( $user_id, 'hr_ja_supervisor_name', sanitize_text_field( $_POST['hr_ja_supervisor_name'] ) );
        update_user_meta( $user_id, 'hr_ja_job_title', sanitize_text_field( $_POST['hr_ja_job_title'] ) );
        update_user_meta( $user_id, 'hr_ja_subordinates', sanitize_text_field( $_POST['hr_ja_subordinates'] ) );
        update_user_meta( $user_id, 'hr_ja_signature_url', sanitize_url( $_POST['hr_ja_signature_url'] ) );
    }
}
