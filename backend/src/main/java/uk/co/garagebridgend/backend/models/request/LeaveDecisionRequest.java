package uk.co.garagebridgend.backend.models.request;

/**
 * Request body used when an admin approves or declines a pending leave request.
 * The {@code response} field is optional — it is stored on the leave record so
 * the employee can see the reason for approval or rejection.
 *
 * @param response optional message from the admin explaining the decision
 */
public record LeaveDecisionRequest(String response) { }
