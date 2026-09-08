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
        register_rest_route( $namespace, '/dashboard', array(
            'methods'  => 'GET',
            'callback' => array( $this, 'get_dashboard_metrics' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );

        // Tasks CRUD
        register_rest_route( $namespace, '/tasks', array(
            'methods'  => 'GET',
            'callback' => array( $this, 'get_tasks' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );
        register_rest_route( $namespace, '/tasks', array(
            'methods'  => 'POST',
            'callback' => array( $this, 'create_task' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );
        register_rest_route( $namespace, '/tasks/(?P<id>\d+)', array(
            'methods'  => 'PUT',
            'callback' => array( $this, 'update_task' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );
        register_rest_route( $namespace, '/tasks/(?P<id>\d+)', array(
            'methods'  => 'DELETE',
            'callback' => array( $this, 'delete_task' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );

        // Documents (JA / SOP) CRUD
        register_rest_route( $namespace, '/documents', array(
            'methods'  => 'GET',
            'callback' => array( $this, 'get_documents' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );
        register_rest_route( $namespace, '/documents', array(
            'methods'  => 'POST',
            'callback' => array( $this, 'create_document' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );
        register_rest_route( $namespace, '/documents/(?P<id>\d+)', array(
            'methods'  => 'PUT',
            'callback' => array( $this, 'update_document' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );
        register_rest_route( $namespace, '/documents/(?P<id>\d+)', array(
            'methods'  => 'DELETE',
            'callback' => array( $this, 'delete_document' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );

        // Diagrams
        register_rest_route( $namespace, '/diagrams', array(
            'methods'  => 'GET',
            'callback' => array( $this, 'get_diagrams' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );
        register_rest_route( $namespace, '/diagrams', array(
            'methods'  => 'POST',
            'callback' => array( $this, 'create_diagram' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );
        register_rest_route( $namespace, '/diagrams/(?P<id>\d+)', array(
            'methods'  => 'PUT',
            'callback' => array( $this, 'update_diagram' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );
        register_rest_route( $namespace, '/diagrams/(?P<id>\d+)', array(
            'methods'  => 'DELETE',
            'callback' => array( $this, 'delete_diagram' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );

        // Users / Profiles
        register_rest_route( $namespace, '/profile', array(
            'methods'  => 'GET',
            'callback' => array( $this, 'get_profile' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );
        register_rest_route( $namespace, '/profile', array(
            'methods'  => 'PUT',
            'callback' => array( $this, 'update_profile' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );
    }

    public function check_permission() {
        return is_user_logged_in();
    }

    // --- Dashboard Metrics ---
    public function get_dashboard_metrics( WP_REST_Request $request ) {
        global $wpdb;
        $user_id = get_current_user_id();
        $task_table = $wpdb->prefix . 'hr_tasks';

        // Tasks assigned to user
        $active_tasks = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $task_table WHERE assignee_id = %d AND status != 'Done'", $user_id ) );
        $completed_tasks = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $task_table WHERE assignee_id = %d AND status = 'Done'", $user_id ) );

        // Total active tasks everywhere (for global view depending on role)
        $total_active = $wpdb->get_var( "SELECT COUNT(*) FROM $task_table WHERE status != 'Done'" );

        // Financial Metrics
        $financial_positive = $wpdb->get_var( "SELECT SUM(financial_value) FROM $task_table WHERE impact_type = 'Positive' AND status = 'Done'" );
        $financial_savings = $wpdb->get_var( "SELECT SUM(financial_value) FROM $task_table WHERE impact_type = 'Cost Saving' AND status = 'Done'" );

        // Recent Delegations
        $recent_delegations = $wpdb->get_results( "SELECT title, assignee_id, status FROM $task_table ORDER BY updated_at DESC LIMIT 3" );

        // Briefing text (Could be an option)
        $morning_briefing = get_option( 'hr_ja_morning_briefing', 'Welcome to a new day. Let us focus on completing pending high-priority tasks.' );

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

        // Ensure only managers/admins can edit evaluation fields
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
        $id = $request->get_param('id');
        $wpdb->delete( $table, array( 'id' => $id ) );
        return rest_ensure_response( array( 'success' => true ) );
    }

    // --- Documents CRUD ---
    public function get_documents( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_documents';
        $type = sanitize_text_field( $request->get_param('type') ); // JA or SOP
        $query = "SELECT * FROM $table";
        if ( $type ) {
            $query .= $wpdb->prepare( " WHERE doc_type = %s", $type );
        }
        $docs = $wpdb->get_results( $query );
        return rest_ensure_response( $docs );
    }

    public function create_document( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_documents';

        $content = wp_kses_post( $request->get_param('content') ); // Expected JSON string of dynamic lists
        $data = array(
            'doc_type' => sanitize_text_field( $request->get_param('doc_type') ),
            'title' => sanitize_text_field( $request->get_param('title') ),
            'status' => 'Draft',
            'department_id' => intval( $request->get_param('department_id') ),
            'creator_id' => get_current_user_id(),
            'content' => $content,
        );
        $wpdb->insert( $table, $data );
        $data['id'] = $wpdb->insert_id;
        return rest_ensure_response( $data );
    }

    public function update_document( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_documents';
        $id = $request->get_param('id');

        $data = array(
            'title' => sanitize_text_field( $request->get_param('title') ),
            'status' => sanitize_text_field( $request->get_param('status') ),
            'content' => wp_kses_post( $request->get_param('content') ),
            'is_approved' => intval( $request->get_param('is_approved') ),
        );
        if ( $data['is_approved'] == 1 ) {
            $data['approver_id'] = get_current_user_id();
        }

        $wpdb->update( $table, $data, array( 'id' => $id ) );
        return rest_ensure_response( array( 'success' => true ) );
    }

    public function delete_document( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_documents';
        $id = $request->get_param('id');
        $wpdb->delete( $table, array( 'id' => $id ) );
        return rest_ensure_response( array( 'success' => true ) );
    }

    // --- Diagrams CRUD ---
    public function get_diagrams( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_diagrams';
        $diagrams = $wpdb->get_results( "SELECT * FROM $table" );
        return rest_ensure_response( $diagrams );
    }

    public function create_diagram( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_diagrams';

        $data = array(
            'title' => sanitize_text_field( $request->get_param('title') ),
            'category' => sanitize_text_field( $request->get_param('category') ),
            'mermaid_script' => sanitize_textarea_field( $request->get_param('mermaid_script') ),
            'department_id' => intval( $request->get_param('department_id') ),
        );
        $wpdb->insert( $table, $data );
        $data['id'] = $wpdb->insert_id;
        return rest_ensure_response( $data );
    }

    public function update_diagram( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_diagrams';
        $id = $request->get_param('id');

        $data = array(
            'title' => sanitize_text_field( $request->get_param('title') ),
            'category' => sanitize_text_field( $request->get_param('category') ),
            'mermaid_script' => sanitize_textarea_field( $request->get_param('mermaid_script') ),
        );

        $wpdb->update( $table, $data, array( 'id' => $id ) );
        return rest_ensure_response( array( 'success' => true ) );
    }

    public function delete_diagram( WP_REST_Request $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'hr_diagrams';
        $id = $request->get_param('id');
        $wpdb->delete( $table, array( 'id' => $id ) );
        return rest_ensure_response( array( 'success' => true ) );
    }

    // --- Profile ---
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
            'signature' => get_user_meta( $user_id, 'hr_ja_signature_url', true ),
            // Include automatic evaluation score
            'evaluation_score' => $this->calculate_evaluation_score( $user_id )
        );
        return rest_ensure_response( $profile );
    }

    public function update_profile( WP_REST_Request $request ) {
        $user_id = get_current_user_id();

        if ( $request->has_param('signature') ) {
            update_user_meta( $user_id, 'hr_ja_signature_url', sanitize_url( $request->get_param('signature') ) );
        }
        // Password updates require current password check, omitted for brevity in REST API here
        return rest_ensure_response( array( 'success' => true ) );
    }

    // --- Evaluation Engine logic ---
    private function calculate_evaluation_score( $user_id ) {
        global $wpdb;
        $task_table = $wpdb->prefix . 'hr_tasks';

        $base_score = 20;

        // Productivity (Max 30) - based on done tasks vs assigned
        $total_assigned = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $task_table WHERE assignee_id = %d", $user_id ) );
        $total_done = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $task_table WHERE assignee_id = %d AND status = 'Done'", $user_id ) );
        $productivity_score = ($total_assigned > 0) ? min(30, ($total_done / $total_assigned) * 30) : 0;

        // Initiative (Max 20)
        $avg_initiative = $wpdb->get_var( $wpdb->prepare( "SELECT AVG(initiative_score) FROM $task_table WHERE assignee_id = %d AND status = 'Done'", $user_id ) );
        $initiative_score = min(20, ($avg_initiative / 5) * 20); // Score out of 5 mapped to 20

        // Financial (Max 30)
        $financial_impact = $wpdb->get_var( $wpdb->prepare( "SELECT SUM(financial_value) FROM $task_table WHERE assignee_id = %d AND (impact_type = 'Positive' OR impact_type = 'Cost Saving') AND status = 'Done'", $user_id ) );
        $financial_score = min(30, $financial_impact > 1000000 ? 30 : ($financial_impact / 1000000) * 30); // E.g., capped at 1 million IDR scale

        // Bonus Complexity (+5 per high priority done)
        $high_priority_done = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $task_table WHERE assignee_id = %d AND status = 'Done' AND priority = 'High'", $user_id ) );
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
}
