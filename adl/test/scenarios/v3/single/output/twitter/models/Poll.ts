import { PollId } from "../aliases/PollId";
import { PollOption } from "./PollOption";
/**
 * @description Represent a Poll attached to a Tweet
 * @since 2.3
 */
export interface Poll {
    /**
     *
     * @since 2.3
     */
    duration_minutes?: int64;
    /**
     *
     * @since 2.3
     */
    end_datetime?: datetime;
    /**
     *
     * @since 2.3
     */
    id: PollId;
    /**
     *
     * @since 2.3
     */
    options: Array<PollOption> & MaximumElements<4> & MinimumElements<2>;
    /**
     *
     * @since 2.3
     */
    voting_status?: "open" | "closed";
}
