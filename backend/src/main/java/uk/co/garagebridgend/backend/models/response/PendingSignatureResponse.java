package uk.co.garagebridgend.backend.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents a single pending document signature.
 * Returned by the admin endpoint that lists all accounts who have not yet
 * signed a document that requires their signature.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PendingSignatureResponse {

    /** ID of the account that has not yet signed. */
    private Long accountId;

    /** Full name of the account holder (firstName + " " + lastName). */
    private String fullName;

    /** ID of the document awaiting the signature. */
    private Long documentId;

    /** Display title of the document. */
    private String documentTitle;

    /**
     * Timestamp at which the document was sent to this recipient.
     * Sourced from {@code DocumentRecipientTable.created}.
     */
    private LocalDateTime sentDate;
}