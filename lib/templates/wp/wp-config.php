<?php
/**
 * Configure WordPress based on the current environment.
 *
 * Don't edit this file!!!
 */

/** Bootstrap PHPDotEnv */
require_once __DIR__ . '/wp-env.php';

/** Define WordPress constants for this environment. */
array_walk( $_ENV, function( $value, $key ) {
	if ( 0 === strpos( $key, 'WPCONST_' ) ) {
		define( substr( $key, 8 ), $value );
	}
} );

/** MySQL hostname */
if ( ! defined( 'DB_HOST' ) ) {
	define( 'DB_HOST', '127.0.0.1' );
}
/** Database Charset to use in creating database tables. */
if ( ! defined( 'DB_CHARSET' ) ) {
	define( 'DB_CHARSET', 'utf8' );
}
/** The Database Collate type. Don't change this if in doubt. */
if ( ! defined( 'DB_COLLATE' ) ) {
	define('DB_COLLATE', '');
}

/**
 * WordPress Database Table prefix.
 */
$table_prefix  = getenv( 'TABLE_PREFIX' );

/**
 * Base variable for multisite situations.
 */
if ( defined( 'MULTISITE' ) && MULTISITE ) {
	$base = getenv( 'INSTALL_BASE' );
}

/**
 * Define site URL constants as needed
 *
 * This helps ensure the correct file paths for the WordPress files which are
 * stored in a sub-director. It should be noted that this removes the ability
 * to change these values in the admin area, but really they should not be
 * changed there anyway, and this works dynamically based on the set config
 * files. If changes are needed, it should be done at a config level, not
 * at a database level.
 *
 * Note that WP_SITEURL is where the wordpress core files live and WP_HOME is
 * where the site home is.
 *
 * You can define these in the .env files if different values are required,
 * but this will set up the default location for them automatically.
 */
if ( ! defined( 'WP_HOME' ) && isset( $_SERVER['SERVER_NAME'] ) ) {
	$protocol = ( isset( $_SERVER['HTTPS'] ) && $_SERVER['HTTPS'] ) ? 'https' : 'http';
	define( 'WP_HOME', $protocol . '://' . $_SERVER['SERVER_NAME'] );
}
if ( ! defined( 'WP_SITEURL' ) && defined( 'WP_HOME' ) ) {
	define( 'WP_SITEURL', WP_HOME . '/<%= wpPath %>' );
}

/**
 * Define content directory and urls as needed.
 *
 * You can define these as environment constants if desired, but if not defined
 * this will set up the default location for them automatically.
 */
if ( ! defined( 'WP_CONTENT_DIR' ) ) {
	define( 'WP_CONTENT_DIR', __DIR__ . '/<%= contentPath %>' );
}
if ( ! defined( 'WP_CONTENT_URL' ) && defined( 'WP_HOME' ) ) {
	define( 'WP_CONTENT_URL', WP_HOME . '/<%= contentPath %>' );
}

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';

/* That's all, happy blogging. */
