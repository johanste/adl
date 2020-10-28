
/**
 * @description Summary of revision metadata.
 * @since 2019-12-01
 */
export interface ApiRevisionContract {
    /**
     * @description Identifier of the API Revision.
     * @since 2019-12-01
     */
    readonly apiId?: string;
    /**
     * @description Revision number of API.
     * @since 2019-12-01
     */
    readonly apiRevision?: string & MaxLength<100> & MinLength<1>;
    /**
     * @description The time the API Revision was created. The date conforms to the following format: yyyy-MM-ddTHH:mm:ssZ as specified by the ISO 8601 standard.
     * @since 2019-12-01
     */
    readonly createdDateTime?: datetime;
    /**
     * @description The time the API Revision were updated. The date conforms to the following format: yyyy-MM-ddTHH:mm:ssZ as specified by the ISO 8601 standard.
     * @since 2019-12-01
     */
    readonly updatedDateTime?: datetime;
    /**
     * @description Description of the API Revision.
     * @since 2019-12-01
     */
    readonly description?: string & MaxLength<256>;
    /**
     * @description Gateway URL for accessing the non-current API Revision.
     * @since 2019-12-01
     */
    readonly privateUrl?: string;
    /**
     * @description Indicates if API revision is the current api revision.
     * @since 2019-12-01
     */
    readonly isOnline?: boolean;
    /**
     * @description Indicates if API revision is accessible via the gateway.
     * @since 2019-12-01
     */
    readonly isCurrent?: boolean;
}
