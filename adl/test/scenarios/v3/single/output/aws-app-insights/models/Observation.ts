import { ObservationId } from "../aliases/ObservationId";
import { LogFilter } from "../enums/LogFilter";
import { Value } from "../aliases/Value";
import { CloudWatchEventSource } from "../enums/CloudWatchEventSource";
import { XRayFaultPercent } from "../aliases/XRayFaultPercent";
import { XRayThrottlePercent } from "../aliases/XRayThrottlePercent";
import { XRayErrorPercent } from "../aliases/XRayErrorPercent";
import { XRayRequestCount } from "../aliases/XRayRequestCount";
import { XRayRequestAverageLatency } from "../aliases/XRayRequestAverageLatency";
/**
 * @description Describes an anomaly or error with the application.
 * @since 2018-11-25
 */
export interface Observation {
    /**
     * @description The ID of the observation type.
     * @since 2018-11-25
     */
    Id?: ObservationId;
    /**
     * @description The time when the observation was first detected, in epoch seconds.
     * @since 2018-11-25
     */
    StartTime?: datetime;
    /**
     * @description The time when the observation ended, in epoch seconds.
     * @since 2018-11-25
     */
    EndTime?: datetime;
    /**
     * @description The source type of the observation.
     * @since 2018-11-25
     */
    SourceType?: string;
    /**
     * @description The source resource ARN of the observation.
     * @since 2018-11-25
     */
    SourceARN?: string;
    /**
     * @description The log group name.
     * @since 2018-11-25
     */
    LogGroup?: string;
    /**
     * @description The timestamp in the CloudWatch Logs that specifies when the matched line occurred.
     * @since 2018-11-25
     */
    LineTime?: datetime;
    /**
     * @description The log text of the observation.
     * @since 2018-11-25
     */
    LogText?: string;
    /**
     * @description The log filter of the observation.
     * @since 2018-11-25
     */
    LogFilter?: LogFilter;
    /**
     * @description The namespace of the observation metric.
     * @since 2018-11-25
     */
    MetricNamespace?: string;
    /**
     * @description The name of the observation metric.
     * @since 2018-11-25
     */
    MetricName?: string;
    /**
     * @description The unit of the source observation metric.
     * @since 2018-11-25
     */
    Unit?: string;
    /**
     * @description The value of the source observation metric.
     * @since 2018-11-25
     */
    Value?: Value;
    /**
     * @description  The ID of the CloudWatch Event-based observation related to the detected problem.
     * @since 2018-11-25
     */
    CloudWatchEventId?: string;
    /**
     * @description  The source of the CloudWatch Event.
     * @since 2018-11-25
     */
    CloudWatchEventSource?: CloudWatchEventSource;
    /**
     * @description  The detail type of the CloudWatch Event-based observation, for example, <code>EC2 Instance State-change Notification</code>.
     * @since 2018-11-25
     */
    CloudWatchEventDetailType?: string;
    /**
     * @description  The Amazon Resource Name (ARN) of the AWS Health Event-based observation.
     * @since 2018-11-25
     */
    HealthEventArn?: string;
    /**
     * @description  The service to which the AWS Health Event belongs, such as EC2.
     * @since 2018-11-25
     */
    HealthService?: string;
    /**
     * @description  The type of the AWS Health event, for example, <code>AWS_EC2_POWER_CONNECTIVITY_ISSUE</code>.
     * @since 2018-11-25
     */
    HealthEventTypeCode?: string;
    /**
     * @description  The category of the AWS Health event, such as <code>issue</code>.
     * @since 2018-11-25
     */
    HealthEventTypeCategory?: string;
    /**
     * @description  The description of the AWS Health event provided by the service, such as Amazon EC2.
     * @since 2018-11-25
     */
    HealthEventDescription?: string;
    /**
     * @description  The deployment ID of the CodeDeploy-based observation related to the detected problem.
     * @since 2018-11-25
     */
    CodeDeployDeploymentId?: string;
    /**
     * @description  The deployment group to which the CodeDeploy deployment belongs.
     * @since 2018-11-25
     */
    CodeDeployDeploymentGroup?: string;
    /**
     * @description  The status of the CodeDeploy deployment, for example <code>SUCCESS</code> or <code> FAILURE</code>.
     * @since 2018-11-25
     */
    CodeDeployState?: string;
    /**
     * @description  The CodeDeploy application to which the deployment belongs.
     * @since 2018-11-25
     */
    CodeDeployApplication?: string;
    /**
     * @description  The instance group to which the CodeDeploy instance belongs.
     * @since 2018-11-25
     */
    CodeDeployInstanceGroupId?: string;
    /**
     * @description  The state of the instance, such as <code>STOPPING</code> or <code>TERMINATING</code>.
     * @since 2018-11-25
     */
    Ec2State?: string;
    /**
     * @description  The X-Ray request fault percentage for this node.
     * @since 2018-11-25
     */
    XRayFaultPercent?: XRayFaultPercent;
    /**
     * @description  The X-Ray request throttle percentage for this node.
     * @since 2018-11-25
     */
    XRayThrottlePercent?: XRayThrottlePercent;
    /**
     * @description  The X-Ray request error percentage for this node.
     * @since 2018-11-25
     */
    XRayErrorPercent?: XRayErrorPercent;
    /**
     * @description  The X-Ray request count for this node.
     * @since 2018-11-25
     */
    XRayRequestCount?: XRayRequestCount;
    /**
     * @description  The X-Ray node request average latency for this node.
     * @since 2018-11-25
     */
    XRayRequestAverageLatency?: XRayRequestAverageLatency;
    /**
     * @description  The name of the X-Ray node.
     * @since 2018-11-25
     */
    XRayNodeName?: string;
    /**
     * @description  The type of the X-Ray node.
     * @since 2018-11-25
     */
    XRayNodeType?: string;
}
