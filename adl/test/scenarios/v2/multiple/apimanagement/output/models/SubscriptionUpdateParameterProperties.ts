import { SubscriptionState } from "../enums/SubscriptionState";
/**
 * @description Parameters supplied to the Update subscription operation.
 * @since 2019-12-01
 */
export interface SubscriptionUpdateParameterProperties {
    /**
     * @description User identifier path: /users/{userId}
     * @since 2019-12-01
     */
    ownerId?: string;
    /**
     * @description Scope like /products/{productId} or /apis or /apis/{apiId}
     * @since 2019-12-01
     */
    scope?: string;
    /**
     * @description Subscription expiration date. The setting is for audit purposes only and the subscription is not automatically expired. The subscription lifecycle can be managed by using the `state` property. The date conforms to the following format: `yyyy-MM-ddTHH:mm:ssZ` as specified by the ISO 8601 standard.
     * @since 2019-12-01
     */
    expirationDate?: datetime;
    /**
     * @description Subscription name.
     * @since 2019-12-01
     */
    displayName?: string;
    /**
     * @description Primary subscription key.
     * @since 2019-12-01
     */
    primaryKey?: string & MaxLength<256> & MinLength<1>;
    /**
     * @description Secondary subscription key.
     * @since 2019-12-01
     */
    secondaryKey?: string & MaxLength<256> & MinLength<1>;
    /**
     * @description Subscription state. Possible states are * active – the subscription is active, * suspended – the subscription is blocked, and the subscriber cannot call any APIs of the product, * submitted – the subscription request has been made by the developer, but has not yet been approved or rejected, * rejected – the subscription request has been denied by an administrator, * cancelled – the subscription has been cancelled by the developer or administrator, * expired – the subscription reached its expiration date and was deactivated.
     * @since 2019-12-01
     */
    state?: SubscriptionState;
    /**
     * @description Comments describing subscription state change by the administrator.
     * @since 2019-12-01
     */
    stateComment?: string;
    /**
     * @description Determines whether tracing can be enabled
     * @since 2019-12-01
     */
    allowTracing?: boolean;
}
