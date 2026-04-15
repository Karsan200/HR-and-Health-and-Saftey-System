package uk.co.garagebridgend.backend.models.response;

/**
 * A lightweight account summary returned by the employee search endpoint.
 * Only exposes the fields needed to populate the autocomplete dropdown.
 *
 * @param accountId   the account's primary key
 * @param fullName    the employee's first and last name combined
 */
public record AccountSearchResponse(
        Long accountId,
        String fullName
) {}