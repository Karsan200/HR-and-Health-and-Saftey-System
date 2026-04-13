update account_table
set username = 'SheppardC'
where username = 'ShepardC';

alter table account_table
    add ble_signature uuid not null unique default uuid() after mobile_pin;

update leave_type_table
    set icon_type = 'beach_access'
    where icon_type = 'sunbed';

update leave_type_table
    set icon_type = 'sick'
    where icon_type = 'medical' and name = 'Sick Leave';

update leave_type_table
    set icon_type = 'priority_high'
    where icon_type = 'warning';

update leave_type_table
    set icon_type = 'child_care', colour_icon = 'ad32a7', colour_bg = 'edd1ec'
    where icon_type = 'medical' and name = 'Maternity/Paternity Leave';

update leave_type_table
    set icon_type = 'money_off'
    where icon_type = 'cross';