import { ResourceGroupName } from "../aliases/ResourceGroupName";
import { MaxEntities } from "../aliases/MaxEntities";
/**
 * ListProblemsRequest
 * @since 2018-11-25
 */
export interface ListProblemsRequest {
    /**
     * @description The name of the resource group.
     * @since 2018-11-25
     */
    ResourceGroupName?: ResourceGroupName;
    /**
     * @description The time when the problem was detected, in epoch seconds. If you don't specify a time frame for the request, problems within the past seven days are returned.
     * @since 2018-11-25
     */
    StartTime?: datetime;
    /**
     * @description The time when the problem ended, in epoch seconds. If not specified, problems within the past seven days are returned.
     * @since 2018-11-25
     */
    EndTime?: datetime;
    /**
     * @description The maximum number of results to return in a single call. To retrieve the remaining results, make another call with the returned <code>NextToken</code> value.
     * @since 2018-11-25
     */
    MaxResults?: MaxEntities;
    /**
     * @description The token to request the next page of results.
     * @since 2018-11-25
     */
    NextToken?: string;
}
