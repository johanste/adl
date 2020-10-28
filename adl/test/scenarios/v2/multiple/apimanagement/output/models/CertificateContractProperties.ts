
/**
 * @description Properties of the Certificate contract.
 * @since 2019-12-01
 */
export interface CertificateContractProperties {
    /**
     * @description Subject attribute of the certificate.
     * @since 2019-12-01
     */
    subject: string;
    /**
     * @description Thumbprint of the certificate.
     * @since 2019-12-01
     */
    thumbprint: string;
    /**
     * @description Expiration date of the certificate. The date conforms to the following format: `yyyy-MM-ddTHH:mm:ssZ` as specified by the ISO 8601 standard.
     *
     * @since 2019-12-01
     */
    expirationDate: datetime;
}
