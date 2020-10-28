import { ConfigurationEventStatus } from "../enums/ConfigurationEventStatus";
import { ConfigurationEventResourceType } from "../enums/ConfigurationEventResourceType";
/**
 * @description  The event information.
 * @since 2018-11-25
 */
export interface ConfigurationEvent {
    /**
     * @description  The resource monitored by Application Insights.
     * @since 2018-11-25
     */
    MonitoredResourceARN?: string;
    /**
     * @description  The status of the configuration update event. Possible values include INFO, WARN, and ERROR.
     * @since 2018-11-25
     */
    EventStatus?: ConfigurationEventStatus;
    /**
     * @description  The resource type that Application Insights attempted to configure, for example, CLOUDWATCH_ALARM.
     * @since 2018-11-25
     */
    EventResourceType?: ConfigurationEventResourceType;
    /**
     * @description  The timestamp of the event.
     * @since 2018-11-25
     */
    EventTime?: datetime;
    /**
     * @description  The details of the event in plain text.
     * @since 2018-11-25
     */
    EventDetail?: string;
    /**
     * @description  The name of the resource Application Insights attempted to configure.
     * @since 2018-11-25
     */
    EventResourceName?: string;
}
