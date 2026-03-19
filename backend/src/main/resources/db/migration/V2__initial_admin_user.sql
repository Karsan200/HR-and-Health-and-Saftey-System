INSERT INTO account_table (first_name, last_name, username, email, password, address_one, address_two, postal_code, created)
VALUES
    (
        'Craig',
        'Sheppard',
        'ShepardC',
        'craig@rentatech.wales',
        '$2a$10$tzYKmlLrSBexziekkN.MKeOc.lASp05b7AO0in3rWRNiDLJpt3bE2',
        'Cardiff University',
        'Newport Road',
        'CF24 0DE',
        NOW()
    ),
    (
        'Thomas',
        'Brown',
        'BrownT',
        'me@tomsw.uk',
        '$2a$10$IQbpsIOVSp1lP3xGu.6Oy.HS45iFDG9kGO3V0s/U0lTtiPpSBQloe',
        'Cardiff University',
        'Newport Road',
        'CF24 0DE',
        NOW()
    );

INSERT INTO permissions_table (account_id, assigned_by, is_admin, is_manager, created)
VALUES
    (
        (SELECT account_id FROM account_table WHERE username = 'ShepardC'),
        NULL,
        true,
        true,
        NOW()
    ),
    (
        (SELECT account_id FROM account_table WHERE username = 'BrownT'),
        NULL,
        true,
        true,
        NOW()
    );