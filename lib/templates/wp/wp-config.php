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
		$value = ( 'true' === $value ) ? true : $value;
		$value = ( 'false' === $value ) ? false : $value;
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
 * Define content directory as needed.
 *
 * You can define these as environment constants if desired, but if not defined
 * this will set up the default location for them automatically.
 */
if ( ! defined( 'WP_CONTENT_DIR' ) ) {
	define( 'WP_CONTENT_DIR', __DIR__ . '/<%= contentPath %>' );
}

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';

/* That's all, happy blogging. */
