<?php
if ( ! defined( 'ABSPATH' ) ) {
    die( 'Direct access not permitted.' );
}

class HR_JA_API_Endpoints {

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        $namespace = 'hr-ja/v1';

        // Dashboard Metrics
        register_rest_route( $namespace, '/dashboard', array('methods' => 'GET', 'callback' => array( $this, 'get_dashboard_metrics' ), 'permission_callback' => array( $this, 'check_permission' )) );

        // Tasks CRUD
        register_rest_route( $namespace, '/tasks', array('methods' => 'GET', 'callback' => array( $this, 'get_tasks' ), 'permission_callback' => array( $this, 'check_permission' )) );
        register_rest_route( $namespace, '/tasks', array('methods' => 'POST', 'callback' => array( $this, 'create_task' ), 'permission_callback' => array( $this, 'check_permission' )) );
        register_rest_route( $namespace, '/tasks/(?P<id>\d+)', array('methods' => 'PUT', 'callback' => array( $this, 'update_task' ), 'permission_callback' => array( $this, 'check_permission' )) );
        register_rest_route( $namespace, '/tasks/(?P<id>\d+)', array('methods' => 'DELETE', 'callback' => array( $this, 'delete_task' ), 'permission_callback' => array( $this, 'check_permission' )) );

        // Users Fetching
        register_rest_route( $namespace, '/users', array('methods' => 'GET', 'callback' => array( $this, 'get_users_list' ), 'permission_callback' => array( $this, 'check_permission' )) );

        // Documents (JA / SOP) CRUD + Duplicate
        register_rest_route( $namespace, '/documents', array('methods' => 'GET', 'callback' => array( $this, 'get_documents' ), 'permission_callback' => array( $this, 'check_permission' )) );
        register_rest_route( $namespace, '/documents', array('methods' => 'POST', 'callback' => array( $this, 'create_document' ), 'permission_callback' => array( $this, 'check_permission' )) );
        register_rest_route( $namespace, '/documents/(?P<id>\d+)', array('methods' => 'PUT', 'callback' => array( $this, 'update_document' ), 'permission_callback' => array( $this, 'check_permission' )) );
        register_rest_route( $namespace, '/documents/(?P<id>\d+)', array('methods' => 'DELETE', 'callback' => array( $this, 'delete_document' ), 'permission_callback' => array( $this, 'check_permission' )) );
        register_rest_route( $namespace, '/documents/(?P<id>\d+)/duplicate', array('methods' => 'POST', 'callback' => array( $this, 'duplicate_document' ), 'permission_callback' => array( $this, 'check_permission' )) );
        register_rest_route( $namespace, '/documents/(?P<id>\d+)/revisions', array('methods' => 'GET', 'callback' => array( $this, 'get_document_revisions' ), 'permission_callback' => array( $this, 'check_permission' )) );

        // Diagrams
        register_rest_route( $namespace, '/diagrams', array('methods' => 'GET', 'callback' => array( $this, 'get_diagrams' ), 'permission_callback' => array( $this, 'check_permission' )) );
        register_rest_route( $namespace, '/diagrams', array('methods' => 'POST', 'callback' => array( $this, 'create_diagram' ), 'permission_callback' => array( $this, 'check_permission' )) );
        register_rest_route( $namespace, '/diagrams/(?P<id>\d+)', array('methods' => 'PUT', 'callback' => array( $this, 'update_diagram' ), 'permission_callback' => array( $this, 'check_permission' )) );
        register_rest_route( $namespace, '/diagrams/(?P<id>\d+)', array('methods' => 'DELETE', 'callback' => array( $this, 'delete_diagram' ), 'permission_callback' => array( $this, 'check_permission' )) );

        // Users / Profiles
        register_rest_route( $namespace, '/profile', array('methods' => 'GET', 'callback' => array( $this, 'get_profile' ), 'permission_callback' => array( $this, 'check_permission' )) );
        register_rest_route( $namespace, '/profile', array('methods' => 'PUT', 'callback' => array( $this, 'update_profile' ), 'permission_callback' => array( $this, 'check_permission' )) );

        // Automated Daily PDFs logic
        register_rest_route( $namespace, '/pdfs', array('methods' => 'POST', 'callback' => array( $this, 'store_pdf' ), 'permission_callback' => array( $this, 'check_permission' )) );
        register_rest_route( $namespace, '/pdfs', array('methods' => 'GET', 'callback' => array( $this, 'get_pdfs' ), 'permission_callback' => array( $this, 'check_permission' )) );
    }

    public function check_permission() {
        return is_user_logged_in();
    }

    // --- Dashboard Metrics ---
    public function get_dashboard_metrics( WP_REST_Request $request ) {
        global $wpdb;
        $user_id = get_current_user_id();
        $task_table = $wpdb->prefix . 'hr_tasks';

        $active_tasks = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $task_table WHERE assignee_id = %d AND status != 'Done'", $user_id ) );
        $completed_tasks = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $task_table WHERE assignee_id = %d AND status = 'Done' AND DATE(updated_at) = CURDATE()", $user_id ) );
        $total_active = $wpdb->get_var( "SELECT COUNT(*) FROM $task_table WHERE status != 'Done'" );
        $financial_positive = $wpdb->get_var( "SELECT SUM(financial_value) FROM $task_table WHERE impact_type = 'Positive' AND status = 'Done'" );
        $financial_savings = $wpdb->get_var( "SELECT SUM(financial_value) FROM $task_table WHERE impact_type = 'Cost Saving' AND status = 'Done'" );
        $recent_delegations = $wpdb->get_results( "SELECT title, assignee_id, status FROM $task_table ORDER BY updated_at DESC LIMIT 3" );
        $morning_briefing = get_option( 'hr_ja_morning_briefing', 'Selamat pagi! Mari fokus pada penyelesaian tugas prioritas hari ini.' );

        return rest_ensure_response( array(
            'active_tasks' => (int) $active_tasks,
            'completed_tasks' => (int) $completed_tasks,
            'total_active' => (int) $total_active,
            'financial_positive' => (float) $financial_positive,
            'financial_savings' => (float) $financial_savings,
            'recent_delegations' => $recent_delegations,
            'morning_briefing' => $morning_briefing
        ) );
    }

    // --- Users List ---
    public function get_users_list( WP_REST_Request $request ) {
        $users = get_users();
        $data = array();
        foreach($users as $u) {
            $data[] = array('id' => $u->ID, 'name' => $u->display_name);
        }
        return rest_ensure_response( $data );
    }

    // --- Tasks CRUD ---
    public function get_tasks( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_tasks';
        $user_id = get_current_user_id();
        $tasks = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table WHERE assignee_id = %d OR creator_id = %d ORDER BY updated_at DESC", $user_id, $user_id ) );
        return rest_ensure_response( $tasks );
    }

    public function create_task( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_tasks';

        $data = array(
            'title' => sanitize_text_field( $request->get_param('title') ),
            'description' => sanitize_textarea_field( $request->get_param('description') ),
            'assignee_id' => intval( $request->get_param('assignee_id') ),
            'creator_id' => get_current_user_id(),
            'category' => sanitize_text_field( $request->get_param('category') ),
            'status' => 'Pending',
            'priority' => sanitize_text_field( $request->get_param('priority') ),
        );
        $wpdb->insert( $table, $data );
        $data['id'] = $wpdb->insert_id;
        return rest_ensure_response( $data );
    }

    public function update_task( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_tasks';
        $id = $request->get_param('id');

        $data = array();
        if ( $request->has_param('status') ) $data['status'] = sanitize_text_field( $request->get_param('status') );
        if ( $request->has_param('notes') ) $data['notes'] = sanitize_textarea_field( $request->get_param('notes') );

        $user_id = get_current_user_id();
        $user = get_userdata( $user_id );
        if ( in_array( 'ja_manager', (array) $user->roles ) || in_array( 'ja_admin', (array) $user->roles ) || in_array( 'administrator', (array) $user->roles ) ) {
            if ( $request->has_param('initiative_score') ) $data['initiative_score'] = intval( $request->get_param('initiative_score') );
            if ( $request->has_param('impact_type') ) $data['impact_type'] = sanitize_text_field( $request->get_param('impact_type') );
            if ( $request->has_param('financial_value') ) $data['financial_value'] = floatval( $request->get_param('financial_value') );
        }

        $wpdb->update( $table, $data, array( 'id' => $id ) );
        return rest_ensure_response( array( 'success' => true ) );
    }

    public function delete_task( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_tasks';
        $wpdb->delete( $table, array( 'id' => $request->get_param('id') ) );
        return rest_ensure_response( array( 'success' => true ) );
    }

    // --- Documents CRUD ---
    public function get_documents( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_documents';
        $type = sanitize_text_field( $request->get_param('type') );
        $query = "SELECT * FROM $table";
        if ( $type ) $query .= $wpdb->prepare( " WHERE doc_type = %s", $type );
        $docs = $wpdb->get_results( $query );
        return rest_ensure_response( $docs );
    }

    public function create_document( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_documents';
        $data = array(
            'doc_type' => sanitize_text_field( $request->get_param('doc_type') ),
            'title' => sanitize_text_field( $request->get_param('title') ),
            'status' => 'Draft',
            'department_id' => intval( $request->get_param('department_id') ),
            'creator_id' => get_current_user_id(),
            'content' => $request->get_param('content'), // Expect JSON
            'wa_script' => sanitize_text_field( $request->get_param('wa_script') )
        );
        $wpdb->insert( $table, $data );
        return rest_ensure_response( array('id' => $wpdb->insert_id) );
    }

    public function update_document( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_documents';
        $id = $request->get_param('id');

        $old_doc = $wpdb->get_row($wpdb->prepare("SELECT content FROM $table WHERE id = %d", $id));
        if ($old_doc) {
            $wpdb->insert($wpdb->prefix . 'hr_document_revisions', array(
                'document_id' => $id, 'editor_id' => get_current_user_id(), 'content' => $old_doc->content
            ));
        }

        $data = array(
            'title' => sanitize_text_field( $request->get_param('title') ),
            'status' => sanitize_text_field( $request->get_param('status') ),
            'content' => $request->get_param('content'),
            'wa_script' => sanitize_text_field( $request->get_param('wa_script') )
        );
        if ( $request->get_param('is_approved') == 1 ) {
            $data['is_approved'] = 1;
            $data['approver_id'] = get_current_user_id();
        }

        $wpdb->update( $table, $data, array( 'id' => $id ) );
        return rest_ensure_response( array( 'success' => true ) );
    }

    public function delete_document( WP_REST_Request $request ) {
        global $wpdb;
        $wpdb->delete( $wpdb->prefix . 'hr_documents', array( 'id' => $request->get_param('id') ) );
        return rest_ensure_response( array( 'success' => true ) );
    }

    public function duplicate_document( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_documents';
        $doc = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $request->get_param('id')), ARRAY_A);
        if ($doc) {
            unset($doc['id']);
            $doc['title'] = $doc['title'] . ' (Copy)';
            $doc['status'] = 'Draft';
            $doc['is_approved'] = 0;
            $doc['approver_id'] = null;
            $doc['created_at'] = current_time('mysql');
            $wpdb->insert($table, $doc);
            return rest_ensure_response( array( 'success' => true, 'id' => $wpdb->insert_id ) );
        }
        return new WP_Error( 'not_found', 'Document not found', array( 'status' => 404 ) );
    }

    public function get_document_revisions( WP_REST_Request $request ) {
        global $wpdb;
        $revs = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}hr_document_revisions WHERE document_id = %d ORDER BY created_at DESC", $request->get_param('id')));
        return rest_ensure_response($revs);
    }

    // --- Diagrams CRUD ---
    public function get_diagrams( WP_REST_Request $request ) {
        global $wpdb;
        return rest_ensure_response( $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}hr_diagrams" ) );
    }

    public function create_diagram( WP_REST_Request $request ) {
        global $wpdb;
        $wpdb->insert( $wpdb->prefix . 'hr_diagrams', array(
            'creator_id' => get_current_user_id(),
            'title' => sanitize_text_field( $request->get_param('title') ),
            'category' => sanitize_text_field( $request->get_param('category') ),
            'mermaid_script' => sanitize_textarea_field( $request->get_param('mermaid_script') )
        ));
        return rest_ensure_response( array('id' => $wpdb->insert_id) );
    }

    public function update_diagram( WP_REST_Request $request ) {
        global $wpdb;
        if ( !$this->check_owner_or_manager('hr_diagrams', $request->get_param('id')) ) return new WP_Error( 'forbidden', 'Access denied', array( 'status' => 403 ) );
        $wpdb->update( $wpdb->prefix . 'hr_diagrams', array(
            'title' => sanitize_text_field( $request->get_param('title') ),
            'category' => sanitize_text_field( $request->get_param('category') ),
            'mermaid_script' => sanitize_textarea_field( $request->get_param('mermaid_script') )
        ), array( 'id' => $request->get_param('id') ));
        return rest_ensure_response( array( 'success' => true ) );
    }

    public function delete_diagram( WP_REST_Request $request ) {
        global $wpdb;
        if ( !$this->check_owner_or_manager('hr_diagrams', $request->get_param('id')) ) return new WP_Error( 'forbidden', 'Access denied', array( 'status' => 403 ) );
        $wpdb->delete( $wpdb->prefix . 'hr_diagrams', array( 'id' => $request->get_param('id') ) );
        return rest_ensure_response( array( 'success' => true ) );
    }

    // --- Profile & Evaluation ---
    public function get_profile( WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        $user_info = get_userdata( $user_id );

        $profile = array(
            'id' => $user_id,
            'name' => $user_info->display_name,
            'email' => $user_info->user_email,
            'department' => get_user_meta( $user_id, 'hr_ja_department', true ),
            'job_title' => get_user_meta( $user_id, 'hr_ja_job_title', true ),
            'supervisor' => get_user_meta( $user_id, 'hr_ja_supervisor_name', true ),
            'subordinates' => get_user_meta( $user_id, 'hr_ja_subordinates', true ),
            'signature' => get_user_meta( $user_id, 'hr_ja_signature_url', true ),
            'evaluation_score' => $this->calculate_evaluation_score( $user_id, sanitize_text_field($request->get_param('period')) )
        );
        return rest_ensure_response( $profile );
    }

    public function update_profile( WP_REST_Request $request ) {
        $user_id = get_current_user_id();
        if ( $request->has_param('signature') ) {
            update_user_meta( $user_id, 'hr_ja_signature_url', sanitize_url( $request->get_param('signature') ) );
        }
        return rest_ensure_response( array( 'success' => true ) );
    }

    private function calculate_evaluation_score( $user_id, $period = 'daily' ) {
        global $wpdb;
        $task_table = $wpdb->prefix . 'hr_tasks';

        $time_filter = "AND DATE(updated_at) = CURDATE()"; // daily default
        if ($period === 'weekly') {
            $time_filter = "AND YEARWEEK(updated_at, 1) = YEARWEEK(CURDATE(), 1)";
        } elseif ($period === 'monthly') {
            $time_filter = "AND MONTH(updated_at) = MONTH(CURDATE()) AND YEAR(updated_at) = YEAR(CURDATE())";
        }

        $base_score = 20;

        $total_assigned = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $task_table WHERE assignee_id = %d $time_filter", $user_id ) );
        $total_done = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $task_table WHERE assignee_id = %d AND status = 'Done' $time_filter", $user_id ) );
        $productivity_score = ($total_assigned > 0) ? min(30, ($total_done / $total_assigned) * 30) : 0;

        $avg_initiative = $wpdb->get_var( $wpdb->prepare( "SELECT AVG(initiative_score) FROM $task_table WHERE assignee_id = %d AND status = 'Done' $time_filter", $user_id ) );
        $avg_initiative = is_numeric($avg_initiative) ? (float) $avg_initiative : 0.0;
        $initiative_score = min(20, ($avg_initiative / 5) * 20);

        $financial_impact = $wpdb->get_var( $wpdb->prepare( "SELECT SUM(financial_value) FROM $task_table WHERE assignee_id = %d AND (impact_type = 'Positive' OR impact_type = 'Cost Saving') AND status = 'Done' $time_filter", $user_id ) );
        $financial_impact = is_numeric($financial_impact) ? (float) $financial_impact : 0.0;
        $financial_score = min(30, $financial_impact > 1000000 ? 30 : ($financial_impact / 1000000) * 30);

        $high_priority_done = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $task_table WHERE assignee_id = %d AND status = 'Done' AND priority = 'Tinggi' $time_filter", $user_id ) );
        $high_priority_done = (int) $high_priority_done;
        $bonus = $high_priority_done * 5;

        $total_score = $base_score + $productivity_score + $initiative_score + $financial_score + $bonus;

        return array(
            'total' => round($total_score, 2),
            'base' => $base_score,
            'productivity' => round($productivity_score, 2),
            'initiative' => round($initiative_score, 2),
            'financial' => round($financial_score, 2),
            'bonus' => $bonus
        );
    }

    // --- Automated PDFs Storage ---
    public function store_pdf( WP_REST_Request $request ) {
        global $wpdb;
        $pdf_base64 = $request->get_param('pdf_base64');
        if ( empty($pdf_base64) ) return new WP_Error('missing_data', 'No PDF data provided', array('status'=>400));

        // Actually save the file to WordPress uploads dir
        $upload_dir = wp_upload_dir();
        $pdf_decoded = base64_decode(preg_replace('#^data:application/\w+;base64,#i', '', $pdf_base64));
        $filename = 'auto_generated_' . sanitize_file_name($request->get_param('pdf_type')) . '_' . get_current_user_id() . '_' . time() . '.pdf';
        $file_path = $upload_dir['path'] . '/' . $filename;

        if ( file_put_contents($file_path, $pdf_decoded) ) {
            $file_url = $upload_dir['url'] . '/' . $filename;
            $wpdb->insert($wpdb->prefix . 'hr_daily_pdfs', array(
                'user_id' => get_current_user_id(),
                'pdf_type' => sanitize_text_field($request->get_param('pdf_type')),
                'date' => current_time('Y-m-d'),
                'file_url' => $file_url
            ));
        } else {
            return new WP_Error('save_failed', 'Could not save PDF to server', array('status'=>500));
        }

        return rest_ensure_response(array('success' => true));
    }

    public function get_pdfs( WP_REST_Request $request ) {
        global $wpdb;
        $type = sanitize_text_field($request->get_param('type'));
        return rest_ensure_response($wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}hr_daily_pdfs WHERE user_id = %d AND pdf_type = %s ORDER BY date DESC", get_current_user_id(), $type)));
    }
}
