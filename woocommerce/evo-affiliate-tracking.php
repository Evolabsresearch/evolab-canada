<?php
/**
 * Plugin Name: EVO Labs Affiliate Cookie Tracker
 * Description: Reads the __evo_aff cookie at checkout and saves the affiliate code
 *              as order meta (_evo_affiliate_code) so the Next.js webhook can
 *              credit the partner's commission in Supabase.
 * Version:     1.0.0
 * Author:      EVO Labs Research
 *
 * Installation:
 *   1. Upload this file to /wp-content/plugins/evo-affiliate-tracking/evo-affiliate-tracking.php
 *   2. Activate the plugin in WordPress → Plugins
 *   3. No settings needed — it runs automatically.
 *
 * How it works:
 *   - Your Next.js middleware (middleware.js) sets __evo_aff=CODE when
 *     a visitor arrives via ?ref=CODE on evolabsresearch.com.
 *   - This plugin reads that cookie when the WooCommerce order is created
 *     and saves it as order meta key _evo_affiliate_code.
 *   - Your webhook at /api/webhooks/woocommerce reads that meta key and
 *     records the commission in Supabase.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // No direct access
}

/**
 * When a new WooCommerce order is created, capture the __evo_aff cookie.
 *
 * Hooks into woocommerce_checkout_order_created (fired after order is created,
 * before payment — so the cookie is still in the request).
 */
add_action( 'woocommerce_checkout_order_created', 'evo_save_affiliate_code_to_order', 10, 1 );

function evo_save_affiliate_code_to_order( $order ) {
    // Read cookie set by Next.js middleware
    $aff_code = isset( $_COOKIE['__evo_aff'] ) ? sanitize_text_field( $_COOKIE['__evo_aff'] ) : '';

    if ( empty( $aff_code ) ) {
        return; // No affiliate cookie — nothing to do
    }

    // Validate: alphanumeric + hyphens/underscores only, max 32 chars
    if ( ! preg_match( '/^[a-zA-Z0-9_\-]{1,32}$/', $aff_code ) ) {
        return;
    }

    // Save to order meta
    $order->update_meta_data( '_evo_affiliate_code', $aff_code );
    $order->save();

    // Optional: log for debugging (remove in production)
    if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
        error_log( '[EVO Affiliate] Order #' . $order->get_id() . ' attributed to: ' . $aff_code );
    }
}


/**
 * Also capture the code in session during cart phase (belt-and-suspenders).
 * If the customer starts checkout on a different page load after the cookie
 * is set, we can read it from the WooCommerce session as well.
 */
add_action( 'woocommerce_add_to_cart', 'evo_capture_affiliate_to_session' );

function evo_capture_affiliate_to_session() {
    if ( isset( $_COOKIE['__evo_aff'] ) && ! WC()->session->get( 'evo_aff' ) ) {
        $aff_code = sanitize_text_field( $_COOKIE['__evo_aff'] );
        if ( preg_match( '/^[a-zA-Z0-9_\-]{1,32}$/', $aff_code ) ) {
            WC()->session->set( 'evo_aff', $aff_code );
        }
    }
}

/**
 * Fallback: if the cookie was gone by checkout time, try the session.
 */
add_action( 'woocommerce_checkout_order_created', 'evo_save_affiliate_code_from_session', 20, 1 );

function evo_save_affiliate_code_from_session( $order ) {
    // Only run if we didn't already save from cookie
    if ( $order->get_meta( '_evo_affiliate_code' ) ) {
        return;
    }

    $aff_code = WC()->session ? WC()->session->get( 'evo_aff', '' ) : '';

    if ( empty( $aff_code ) ) {
        return;
    }

    $order->update_meta_data( '_evo_affiliate_code', $aff_code );
    $order->save();
}


/**
 * Show affiliate code in order admin meta box (helpful for manual checks).
 */
add_action( 'woocommerce_admin_order_data_after_order_details', 'evo_display_affiliate_code_in_admin', 10, 1 );

function evo_display_affiliate_code_in_admin( $order ) {
    $aff_code = $order->get_meta( '_evo_affiliate_code' );
    if ( ! $aff_code ) return;
    ?>
    <p class="form-field form-field-wide">
        <strong><?php esc_html_e( 'EVO Affiliate Code:', 'evo-affiliate' ); ?></strong>
        <span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:4px;font-size:12px;">
            <?php echo esc_html( $aff_code ); ?>
        </span>
    </p>
    <?php
}
