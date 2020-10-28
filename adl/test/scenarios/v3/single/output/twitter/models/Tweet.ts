import { MediaKey } from "../aliases/MediaKey";
import { PollId } from "../aliases/PollId";
import { UserID } from "../aliases/UserID";
import { ContextAnnotation } from "./ContextAnnotation";
import { FullTextEntities } from "./FullTextEntities";
import { Point } from "./Point";
import { TweetID } from "../aliases/TweetID";
import { TweetWithheld } from "./TweetWithheld";
/**
 *
 * @since 2.3
 */
export interface Tweet {
    /**
     * @description Specifies the type of attachments (if any) present in this Tweet.
     * @since 2.3
     */
    attachments?: {
        media_keys?: Array<MediaKey> & MinimumElements<1>;
        poll_ids?: Array<PollId> & MinimumElements<1>;
    };
    /**
     *
     * @since 2.3
     */
    author_id?: UserID;
    /**
     *
     * @since 2.3
     */
    context_annotations?: Array<ContextAnnotation> & MinimumElements<1>;
    /**
     * @description Creation time of the Tweet.
     * @since 2.3
     */
    created_at?: datetime;
    /**
     *
     * @since 2.3
     */
    entities?: FullTextEntities;
    /**
     * @description The location tagged on the Tweet, if the user provided one.
     * @since 2.3
     */
    geo?: {
        coordinates?: Point;
        place_id?: string;
    };
    /**
     *
     * @since 2.3
     */
    id: TweetID;
    /**
     *
     * @since 2.3
     */
    in_reply_to_user_id?: UserID;
    /**
     * @description Language of the Tweet, if detected by Twitter. Returned as a BCP47 language tag.
     * @since 2.3
     */
    lang?: string;
    /**
     * @description Indicates if this Tweet contains URLs marked as sensitive, for example content suitable for mature audiences.
     * @since 2.3
     */
    possibly_sensitive?: boolean;
    /**
     * @description Engagement metrics for the Tweet at the time of the request.
     * @since 2.3
     */
    public_metrics?: {
        like_count: int64;
        quote_count?: int64;
        reply_count: int64;
        retweet_count: int64;
    };
    /**
     * @description A list of Tweets this Tweet refers to. For example, if the parent Tweet is a Retweet, a Quoted Tweet or a Reply, it will include the related Tweet referenced to by its parent.
     * @since 2.3
     */
    referenced_tweets?: Array<{
        id: TweetID;
        type: "retweeted" | "quoted" | "replied_to";
    }> & MinimumElements<1>;
    /**
     * @description The name of the app the user Tweeted from.
     * @since 2.3
     */
    source?: string;
    /**
     * @description The content of the Tweet.
     * @since 2.3
     */
    text: string;
    /**
     *
     * @since 2.3
     */
    withheld?: TweetWithheld;
}
