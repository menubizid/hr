<?php
if ( ! defined( 'ABSPATH' ) ) {
    die( 'Direct access not permitted.' );
}

class HR_JA_DB_Setup {
    public static function activate() {
        self::create_tables();
        self::add_roles();
    }

    public static function deactivate() {
        // Optional cleanup
    }

    private static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

        // Table for Departments
        $table_departments = $wpdb->prefix . 'hr_departments';
        $sql_dept = "CREATE TABLE $table_departments (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            description text,
            pic_id bigint(20),
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        dbDelta( $sql_dept );

        // Table for Tasks
        $table_tasks = $wpdb->prefix . 'hr_tasks';
        $sql_tasks = "CREATE TABLE $table_tasks (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            description text,
            assignee_id bigint(20) NOT NULL,
            creator_id bigint(20) NOT NULL,
            category varchar(100) NOT NULL,
            status varchar(50) NOT NULL,
            priority varchar(50) NOT NULL,
            initiative_score int(11) DEFAULT 0,
            impact_type varchar(50),
            financial_value decimal(15,2) DEFAULT 0.00,
            notes text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        dbDelta( $sql_tasks );

        // Table for Documents (JA & SOP)
        $table_docs = $wpdb->prefix . 'hr_documents';
        $sql_docs = "CREATE TABLE $table_docs (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            doc_type varchar(50) NOT NULL,
            title varchar(255) NOT NULL,
            status varchar(50) NOT NULL,
            department_id bigint(20),
            creator_id bigint(20),
            content longtext,
            views int(11) DEFAULT 0,
            is_approved tinyint(1) DEFAULT 0,
            approver_id bigint(20),
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        dbDelta( $sql_docs );

        // Table for Diagrams Library
        $table_diagrams = $wpdb->prefix . 'hr_diagrams';
        $sql_diagrams = "CREATE TABLE $table_diagrams (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            category varchar(100),
            mermaid_script text,
            department_id bigint(20),
            related_doc_id bigint(20),
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        dbDelta( $sql_diagrams );
    }

    private static function add_roles() {
        add_role( 'ja_employee', 'Karyawan', array( 'read' => true ) );
        add_role( 'ja_manager', 'Manajer', array( 'read' => true ) );
        add_role( 'ja_admin', 'Admin HR', array( 'read' => true, 'manage_options' => true ) );
    }
}
