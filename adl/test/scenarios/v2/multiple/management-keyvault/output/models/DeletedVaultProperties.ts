
/**
 * @description Properties of the deleted vault.
 * @since 2019-09-01
 */
export interface DeletedVaultProperties {
    /**
     * @description The resource id of the original vault.
     * @since 2019-09-01
     */
    readonly vaultId?: string;
    /**
     * @description The location of the original vault.
     * @since 2019-09-01
     */
    readonly location?: string;
    /**
     * @description The deleted date.
     * @since 2019-09-01
     */
    readonly deletionDate?: datetime;
    /**
     * @description The scheduled purged date.
     * @since 2019-09-01
     */
    readonly scheduledPurgeDate?: datetime;
    /**
     * @description Tags of the original vault.
     * @since 2019-09-01
     */
    readonly tags?: Dictionary<string>;
}
