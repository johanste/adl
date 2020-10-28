import { SubscriptionState } from "../enums/SubscriptionState";
/**
 * @description Subscription details.
 * @since 2019-12-01
 */
export interface SubscriptionContractProperties {
    /**
     * @description The user resource identifier of the subscription owner. The value is a valid relative URL in the format of /users/{userId} where {userId} is a user identifier.
     * @since 2019-12-01
     */
    ownerId?: string;
    /**
     * @description Scope like /products/{productId} or /apis or /apis/{apiId}.
     * @since 2019-12-01
     */
    scope: string;
    /**
     * @description The name of the subscription, or null if the subscription has no name.
     * @since 2019-12-01
     */
    displayName?: string & MaxLength<100> & MinLength<0>;
    /**
     * @description Subscription state. Possible states are * active – the subscription is active, * suspended – the subscription is blocked, and the subscriber cannot call any APIs of the product, * submitted – the subscription request has been made by the developer, but has not yet been approved or rejected, * rejected – the subscription request has been denied by an administrator, * cancelled – the subscription has been cancelled by the developer or administrator, * expired – the subscription reached its expiration date and was deactivated.
     * @since 2019-12-01
     */
    state: SubscriptionState;
    /**
     * @description Subscription creation date. The date conforms to the following format: `yyyy-MM-ddTHH:mm:ssZ` as specified by the ISO 8601 standard.
     *
     * @since 2019-12-01
     */
    readonly createdDate?: datetime;
    /**
     * @description Subscription activation date. The setting is for audit purposes only and the subscription is not automatically activated. The subscription lifecycle can be managed by using the `state` property. The date conforms to the following format: `yyyy-MM-ddTHH:mm:ssZ` as specified by the ISO 8601 standard.
     *
     * @since 2019-12-01
     */
    startDate?: datetime;
    /**
     * @description Subscription expiration date. The setting is for audit purposes only and the subscription is not automatically expired. The subscription lifecycle can be managed by using the `state` property. The date conforms to the following format: `yyyy-MM-ddTHH:mm:ssZ` as specified by the ISO 8601 standard.
     *
     * @since 2019-12-01
     */
    expirationDate?: datetime;
    /**
     * @description Date when subscription was cancelled or expired. The setting is for audit purposes only and the subscription is not automatically cancelled. The subscription lifecycle can be managed by using the `state` property. The date conforms to the following format: `yyyy-MM-ddTHH:mm:ssZ` as specified by the ISO 8601 standard.
     *
     * @since 2019-12-01
     */
    endDate?: datetime;
    /**
     * @description Upcoming subscription expiration notification date. The date conforms to the following format: `yyyy-MM-ddTHH:mm:ssZ` as specified by the ISO 8601 standard.
     *
     * @since 2019-12-01
     */
    notificationDate?: datetime;
    /**
     * @description Subscription primary key. This property will not be filled on 'GET' operations! Use '/listSecrets' POST request to get the value.
     * @since 2019-12-01
     */
    primaryKey?: string & MaxLength<256> & MinLength<1>;
    /**
     * @description Subscription secondary key. This property will not be filled on 'GET' operations! Use '/listSecrets' POST request to get the value.
     * @since 2019-12-01
     */
    secondaryKey?: string & MaxLength<256> & MinLength<1>;
    /**
     * @description Optional subscription comment added by an administrator.
     * @since 2019-12-01
     */
    stateComment?: string;
    /**
     * @description Determines whether tracing is enabled
     * @since 2019-12-01
     */
    allowTracing?: boolean;
}
