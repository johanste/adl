
/**
 * @description API Release details
 * @since 2019-12-01
 */
export interface ApiReleaseContractProperties {
    /**
     * @description Identifier of the API the release belongs to.
     * @since 2019-12-01
     */
    apiId?: string;
    /**
     * @description The time the API was released. The date conforms to the following format: yyyy-MM-ddTHH:mm:ssZ as specified by the ISO 8601 standard.
     * @since 2019-12-01
     */
    readonly createdDateTime?: datetime;
    /**
     * @description The time the API release was updated.
     * @since 2019-12-01
     */
    readonly updatedDateTime?: datetime;
    /**
     * @description Release Notes
     * @since 2019-12-01
     */
    notes?: string;
}
