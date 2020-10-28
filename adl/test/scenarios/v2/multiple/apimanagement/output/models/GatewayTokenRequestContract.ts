import { KeyType } from "../enums/KeyType";
/**
 * @description Gateway token request contract properties.
 * @since 2019-12-01
 */
export interface GatewayTokenRequestContract {
    /**
     * @description The Key to be used to generate gateway token.
     * @since 2019-12-01
     */
    keyType: KeyType;
    /**
     * @description The Expiry time of the Token. Maximum token expiry time is set to 30 days. The date conforms to the following format: `yyyy-MM-ddTHH:mm:ssZ` as specified by the ISO 8601 standard.
     *
     * @since 2019-12-01
     */
    expiry: datetime;
}
