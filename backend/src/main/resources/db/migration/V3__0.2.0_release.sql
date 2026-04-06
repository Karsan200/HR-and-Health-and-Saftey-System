alter table settings_table
    add highlight_text bit not null default 0 after dyslexic_font;

alter table themes_table
    modify accent varchar(7) not null;

alter table themes_table
    modify background varchar(7) not null;

alter table themes_table
drop column midground;

alter table themes_table
    modify text varchar(7) not null;

alter table themes_table
    add theme text null;

INSERT INTO leave_type_table (name,colour_icon,colour_bg,icon_type) VALUES
      ('Holiday', '14A45A', 'D0EDDE', 'sunbed'),
      ('Sick Leave', 'D20414', 'F6CDD0', 'medical'),
      ('Emergency Leave', 'E8960A', 'FFECCD', 'warning'),
      ('Maternity/Paternity Leave', 'D20414', 'F6CDD0', 'medical'),
      ('Unpaid Leave', '588FFF', 'E6ECF9', 'cross');

INSERT INTO settings_table (account_id, dictation, dyslexic_font, large_text, silent_end, silent_start, text_to_speech, highlight_text) VALUES
    (
        (SELECT account_id FROM account_table WHERE username = 'ShepardC'),
        false,
        false,
        false,
        '08:00:00',
        '18:00:00',
        false,
        false
    ),
    (
        (SELECT account_id FROM account_table WHERE username = 'BrownT'),
        false,
        false,
        false,
        '08:00:00',
        '18:00:00',
        false,
        false
    );

INSERT INTO themes_table (account_id, accent, background, text, theme) VALUES
    (
        (SELECT account_id FROM account_table WHERE username = 'ShepardC'),
        'D20414',
        'F6F6F8',
        '000000',
        'DEFAULT'
    ),
    (
        (SELECT account_id FROM account_table WHERE username = 'BrownT'),
        'D20414',
        'F6F6F8',
        '000000',
        'DEFAULT'
    );