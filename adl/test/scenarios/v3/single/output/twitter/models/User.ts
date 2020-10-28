import { FullTextEntities } from "./FullTextEntities";
import { UrlEntity } from "./UrlEntity";
import { UserID } from "../aliases/UserID";
import { TweetID } from "../aliases/TweetID";
import { UserName } from "../aliases/UserName";
import { UserWithheld } from "./UserWithheld";
/**
 * @description The Twitter User object
 * @since 2.3
 */
export interface User {
    /**
     * @description Creation time of this user.
     * @since 2.3
     */
    created_at?: datetime;
    /**
     * @description The text of this user's profile description (also known as bio), if the user provided one.
     * @since 2.3
     */
    description?: string;
    /**
     * @description A list of metadata found in the user's profile description.
     * @since 2.3
     */
    entities?: {
        description?: FullTextEntities;
        url?: {
            urls?: Array<UrlEntity> & MinimumElements<1>;
        };
    };
    /**
     *
     * @since 2.3
     */
    id: UserID;
    /**
     * @description The location specified in the user's profile, if the user provided one. As this is a freeform value, it may not indicate a valid location, but it may be fuzzily evaluated when performing searches with location queries.
     * @since 2.3
     */
    location?: string;
    /**
     * @description The friendly name of this user, as shown on their profile.
     * @since 2.3
     */
    name: string;
    /**
     *
     * @since 2.3
     */
    pinned_tweet_id?: TweetID;
    /**
     * @description The URL to the profile image for this user.
     * @since 2.3
     */
    profile_image_url?: string;
    /**
     * @description Indicates if this user has chosen to protect their Tweets (in other words, if this user's Tweets are private).
     * @since 2.3
     */
    protected?: boolean;
    /**
     * @description A list of metrics for this user
     * @since 2.3
     */
    public_metrics?: {
        followers_count: int64;
        following_count: int64;
        listed_count: int64;
        tweet_count: int64;
    };
    /**
     * @description The URL specified in the user's profile.
     * @since 2.3
     */
    url?: string;
    /**
     *
     * @since 2.3
     */
    username: UserName;
    /**
     * @description Indicate if this user is a verified Twitter User.
     * @since 2.3
     */
    verified?: boolean;
    /**
     *
     * @since 2.3
     */
    withheld?: UserWithheld;
}
