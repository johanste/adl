
/**
 * @description Request Report data.
 * @since 2019-12-01
 */
export interface RequestReportRecordContract {
    /**
     * @description API identifier path. /apis/{apiId}
     * @since 2019-12-01
     */
    apiId?: string;
    /**
     * @description Operation identifier path. /apis/{apiId}/operations/{operationId}
     * @since 2019-12-01
     */
    operationId?: string;
    /**
     * @description Product identifier path. /products/{productId}
     * @since 2019-12-01
     */
    readonly productId?: string;
    /**
     * @description User identifier path. /users/{userId}
     * @since 2019-12-01
     */
    readonly userId?: string;
    /**
     * @description The HTTP method associated with this request..
     * @since 2019-12-01
     */
    method?: string;
    /**
     * @description The full URL associated with this request.
     * @since 2019-12-01
     */
    url?: string;
    /**
     * @description The client IP address associated with this request.
     * @since 2019-12-01
     */
    ipAddress?: string;
    /**
     * @description The HTTP status code received by the gateway as a result of forwarding this request to the backend.
     * @since 2019-12-01
     */
    backendResponseCode?: string;
    /**
     * @description The HTTP status code returned by the gateway.
     * @since 2019-12-01
     */
    responseCode?: int32;
    /**
     * @description The size of the response returned by the gateway.
     * @since 2019-12-01
     */
    responseSize?: int32;
    /**
     * @description The date and time when this request was received by the gateway in ISO 8601 format.
     * @since 2019-12-01
     */
    timestamp?: datetime;
    /**
     * @description Specifies if response cache was involved in generating the response. If the value is none, the cache was not used. If the value is hit, cached response was returned. If the value is miss, the cache was used but lookup resulted in a miss and request was fulfilled by the backend.
     * @since 2019-12-01
     */
    cache?: string;
    /**
     * @description The total time it took to process this request.
     * @since 2019-12-01
     */
    apiTime?: double;
    /**
     * @description he time it took to forward this request to the backend and get the response back.
     * @since 2019-12-01
     */
    serviceTime?: double;
    /**
     * @description Azure region where the gateway that processed this request is located.
     * @since 2019-12-01
     */
    apiRegion?: string;
    /**
     * @description Subscription identifier path. /subscriptions/{subscriptionId}
     * @since 2019-12-01
     */
    subscriptionId?: string;
    /**
     * @description Request Identifier.
     * @since 2019-12-01
     */
    requestId?: string;
    /**
     * @description The size of this request..
     * @since 2019-12-01
     */
    requestSize?: int32;
}
