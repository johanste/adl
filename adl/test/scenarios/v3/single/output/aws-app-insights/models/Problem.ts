import { ProblemId } from "../aliases/ProblemId";
import { Status } from "../enums/Status";
import { SeverityLevel } from "../enums/SeverityLevel";
import { ResourceGroupName } from "../aliases/ResourceGroupName";
import { Feedback } from "../aliases/Feedback";
/**
 * @description Describes a problem that is detected by correlating observations.
 * @since 2018-11-25
 */
export interface Problem {
    /**
     * @description The ID of the problem.
     * @since 2018-11-25
     */
    Id?: ProblemId;
    /**
     * @description The name of the problem.
     * @since 2018-11-25
     */
    Title?: string;
    /**
     * @description A detailed analysis of the problem using machine learning.
     * @since 2018-11-25
     */
    Insights?: string;
    /**
     * @description The status of the problem.
     * @since 2018-11-25
     */
    Status?: Status;
    /**
     * @description The resource affected by the problem.
     * @since 2018-11-25
     */
    AffectedResource?: string;
    /**
     * @description The time when the problem started, in epoch seconds.
     * @since 2018-11-25
     */
    StartTime?: datetime;
    /**
     * @description The time when the problem ended, in epoch seconds.
     * @since 2018-11-25
     */
    EndTime?: datetime;
    /**
     * @description A measure of the level of impact of the problem.
     * @since 2018-11-25
     */
    SeverityLevel?: SeverityLevel;
    /**
     * @description The name of the resource group affected by the problem.
     * @since 2018-11-25
     */
    ResourceGroupName?: ResourceGroupName;
    /**
     * @description Feedback provided by the user about the problem.
     * @since 2018-11-25
     */
    Feedback?: Feedback & MaximumProperties<10>;
}
