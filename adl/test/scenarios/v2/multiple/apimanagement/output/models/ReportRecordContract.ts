
/**
 * @description Report data.
 * @since 2019-12-01
 */
export interface ReportRecordContract {
    /**
     * @description Name depending on report endpoint specifies product, API, operation or developer name.
     * @since 2019-12-01
     */
    name?: string;
    /**
     * @description Start of aggregation period. The date conforms to the following format: `yyyy-MM-ddTHH:mm:ssZ` as specified by the ISO 8601 standard.
     *
     * @since 2019-12-01
     */
    timestamp?: datetime;
    /**
     * @description Length of aggregation period.  Interval must be multiple of 15 minutes and may not be zero. The value should be in ISO 8601 format (http://en.wikipedia.org/wiki/ISO_8601#Durations).
     * @since 2019-12-01
     */
    interval?: string;
    /**
     * @description Country to which this record data is related.
     * @since 2019-12-01
     */
    country?: string;
    /**
     * @description Country region to which this record data is related.
     * @since 2019-12-01
     */
    region?: string;
    /**
     * @description Zip code to which this record data is related.
     * @since 2019-12-01
     */
    zip?: string;
    /**
     * @description User identifier path. /users/{userId}
     * @since 2019-12-01
     */
    readonly userId?: string;
    /**
     * @description Product identifier path. /products/{productId}
     * @since 2019-12-01
     */
    readonly productId?: string;
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
     * @description API region identifier.
     * @since 2019-12-01
     */
    apiRegion?: string;
    /**
     * @description Subscription identifier path. /subscriptions/{subscriptionId}
     * @since 2019-12-01
     */
    subscriptionId?: string;
    /**
     * @description Number of successful calls. This includes calls returning HttpStatusCode <= 301 and HttpStatusCode.NotModified and HttpStatusCode.TemporaryRedirect
     * @since 2019-12-01
     */
    callCountSuccess?: int32;
    /**
     * @description Number of calls blocked due to invalid credentials. This includes calls returning HttpStatusCode.Unauthorized and HttpStatusCode.Forbidden and HttpStatusCode.TooManyRequests
     * @since 2019-12-01
     */
    callCountBlocked?: int32;
    /**
     * @description Number of calls failed due to proxy or backend errors. This includes calls returning HttpStatusCode.BadRequest(400) and any Code between HttpStatusCode.InternalServerError (500) and 600
     * @since 2019-12-01
     */
    callCountFailed?: int32;
    /**
     * @description Number of other calls.
     * @since 2019-12-01
     */
    callCountOther?: int32;
    /**
     * @description Total number of calls.
     * @since 2019-12-01
     */
    callCountTotal?: int32;
    /**
     * @description Bandwidth consumed.
     * @since 2019-12-01
     */
    bandwidth?: int64;
    /**
     * @description Number of times when content was served from cache policy.
     * @since 2019-12-01
     */
    cacheHitCount?: int32;
    /**
     * @description Number of times content was fetched from backend.
     * @since 2019-12-01
     */
    cacheMissCount?: int32;
    /**
     * @description Average time it took to process request.
     * @since 2019-12-01
     */
    apiTimeAvg?: double;
    /**
     * @description Minimum time it took to process request.
     * @since 2019-12-01
     */
    apiTimeMin?: double;
    /**
     * @description Maximum time it took to process request.
     * @since 2019-12-01
     */
    apiTimeMax?: double;
    /**
     * @description Average time it took to process request on backend.
     * @since 2019-12-01
     */
    serviceTimeAvg?: double;
    /**
     * @description Minimum time it took to process request on backend.
     * @since 2019-12-01
     */
    serviceTimeMin?: double;
    /**
     * @description Maximum time it took to process request on backend.
     * @since 2019-12-01
     */
    serviceTimeMax?: double;
}
