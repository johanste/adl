import { QuotaCounterValueContractProperties } from "./QuotaCounterValueContractProperties";
/**
 * @description Quota counter details.
 * @since 2019-12-01
 */
export interface QuotaCounterContract {
    /**
     * @description The Key value of the Counter. Must not be empty.
     * @since 2019-12-01
     */
    counterKey: string & MinLength<1>;
    /**
     * @description Identifier of the Period for which the counter was collected. Must not be empty.
     * @since 2019-12-01
     */
    periodKey: string & MinLength<1>;
    /**
     * @description The date of the start of Counter Period. The date conforms to the following format: `yyyy-MM-ddTHH:mm:ssZ` as specified by the ISO 8601 standard.
     *
     * @since 2019-12-01
     */
    periodStartTime: datetime;
    /**
     * @description The date of the end of Counter Period. The date conforms to the following format: `yyyy-MM-ddTHH:mm:ssZ` as specified by the ISO 8601 standard.
     *
     * @since 2019-12-01
     */
    periodEndTime: datetime;
    /**
     * @description Quota Value Properties
     * @since 2019-12-01
     */
    value?: QuotaCounterValueContractProperties;
}
