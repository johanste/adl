import { State } from "../enums/State";
/**
 * @description Issue contract Base Properties.
 * @since 2019-12-01
 */
export interface IssueContractBaseProperties {
    /**
     * @description Date and time when the issue was created.
     * @since 2019-12-01
     */
    createdDate?: datetime;
    /**
     * @description Status of the issue.
     * @since 2019-12-01
     */
    state?: State;
    /**
     * @description A resource identifier for the API the issue was created for.
     * @since 2019-12-01
     */
    apiId?: string;
}
