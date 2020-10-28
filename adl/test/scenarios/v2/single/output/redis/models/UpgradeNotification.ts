
/**
 * @description Properties of upgrade notification.
 * @since 2018-03-01
 */
export interface UpgradeNotification {
    /**
     * @description Name of upgrade notification.
     * @since 2018-03-01
     */
    readonly name?: string;
    /**
     * @description Timestamp when upgrade notification occurred.
     * @since 2018-03-01
     */
    readonly timestamp?: datetime;
    /**
     * @description Details about this upgrade notification
     * @since 2018-03-01
     */
    readonly upsellNotification?: Dictionary<string>;
}
