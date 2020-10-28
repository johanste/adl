
/**
 * @description Tenant Configuration Synchronization State.
 * @since 2019-12-01
 */
export interface TenantConfigurationSyncStateContract {
    /**
     * @description The name of Git branch.
     * @since 2019-12-01
     */
    branch?: string;
    /**
     * @description The latest commit Id.
     * @since 2019-12-01
     */
    commitId?: string;
    /**
     * @description value indicating if last sync was save (true) or deploy (false) operation.
     * @since 2019-12-01
     */
    isExport?: boolean;
    /**
     * @description value indicating if last synchronization was later than the configuration change.
     * @since 2019-12-01
     */
    isSynced?: boolean;
    /**
     * @description value indicating whether Git configuration access is enabled.
     * @since 2019-12-01
     */
    isGitEnabled?: boolean;
    /**
     * @description The date of the latest synchronization. The date conforms to the following format: `yyyy-MM-ddTHH:mm:ssZ` as specified by the ISO 8601 standard.
     *
     * @since 2019-12-01
     */
    syncDate?: datetime;
    /**
     * @description The date of the latest configuration change. The date conforms to the following format: `yyyy-MM-ddTHH:mm:ssZ` as specified by the ISO 8601 standard.
     *
     * @since 2019-12-01
     */
    configurationChangeDate?: datetime;
}
