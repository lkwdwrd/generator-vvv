<?php
/**
 * Loads up the phpdotenv system and bootstraps the environment.
 */

if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	require_once __DIR__ . '/vendor/autoload.php';
} else {
	die( '<h1>Composer Not Installed</h1><p>Please run <code>composer install</code> to get started.</p>' );
}

$dotenv = new Dotenv\Dotenv( __DIR__ );
$dotenv->load();
$dotenv->required( array(
	'WPCONST_DB_NAME',
	'WPCONST_DB_USER',
	'WPCONST_DB_PASSWORD',
	'WPCONST_AUTH_KEY',
	'WPCONST_SECURE_AUTH_KEY',
	'WPCONST_LOGGED_IN_KEY',
	'WPCONST_NONCE_KEY',
	'WPCONST_AUTH_SALT',
	'WPCONST_SECURE_AUTH_SALT',
	'WPCONST_LOGGED_IN_SALT',
	'WPCONST_NONCE_SALT',
	'TABLE_PREFIX',
) )->notEmpty();
