
/**
 * @description Issue Comment contract Properties.
 * @since 2019-12-01
 */
export interface IssueCommentContractProperties {
    /**
     * @description Comment text.
     * @since 2019-12-01
     */
    text: string;
    /**
     * @description Date and time when the comment was created.
     * @since 2019-12-01
     */
    createdDate?: datetime;
    /**
     * @description A resource identifier for the user who left the comment.
     * @since 2019-12-01
     */
    userId: string;
}
